//! Research agent that handles a single crate research request.
//!
//! When a user calls the `rust_crate_query` tool, a research agent is spawned
//! to investigate the crate sources and return findings. Each research agent:
//! 1. Creates a new sub-agent session with crate_sources_mcp tools
//! 2. Sends the research prompt to the sub-agent
//! 3. Waits for the sub-agent to complete its investigation
//! 4. Returns the findings to the original caller

use crate::{crate_research_mcp, crate_sources_mcp, state::ResearchState};
use sacp::{
    schema::{NewSessionRequest, NewSessionResponse, PromptRequest, PromptResponse},
    JrConnectionCx,
};
use sacp_proxy::McpServiceRegistry;
use sacp_rmcp::McpServiceRegistryRmcpExt;
use std::sync::Arc;
use tokio::sync::mpsc;

/// Run a research agent to investigate a Rust crate.
///
/// This function:
/// 1. Creates a fresh MCP service registry with a per-instance response channel
/// 2. Sends NewSessionRequest with the sub-agent MCP server (containing get_rust_crate_source + return_response_to_user)
/// 3. Receives session_id from the agent
/// 4. Registers the session_id in shared ResearchState so the main loop knows this is a research session
/// 5. Sends PromptRequest with the user's research prompt
/// 6. Waits for responses from the sub-agent via return_response_to_user calls
/// 7. Accumulates all responses and sends them back through request.response_tx
/// 8. Cleans up the session_id from ResearchState
pub async fn run(
    cx: JrConnectionCx,
    state: Arc<ResearchState>,
    request: crate_research_mcp::ResearchRequest,
) -> Result<(), sacp::Error> {
    tracing::info!(
        "Handling research request for crate '{}' version {:?}",
        request.crate_name,
        request.crate_version
    );

    // Create a channel for receiving responses from the sub-agent's return_response_to_user calls
    let (response_tx, mut response_rx) = mpsc::channel::<serde_json::Value>(32);

    // Create a fresh MCP service registry for this research session
    // The SubAgentService instance holds the response_tx to send findings back
    let sub_agent_mcp_registry = McpServiceRegistry::default()
        .with_rmcp_server("rust-crate-sources", move || {
            crate_sources_mcp::SubAgentService::new(response_tx.clone())
        })?;

    // Spawn the sub-agent session with the per-instance MCP registry
    let NewSessionResponse {
        session_id,
        modes: _,
        meta: _,
    } = cx
        .send_request(research_agent_session_request(sub_agent_mcp_registry)?)
        .block_task()
        .await?;

    tracing::info!("Research session created: {}", session_id);

    // Register this session_id in shared state so the main loop knows it's a research session
    state.register_session(&session_id);

    // Send the research prompt to the sub-agent
    let prompt_request = PromptRequest {
        session_id: session_id.clone(),
        prompt: vec![request.prompt.clone().into()],
        meta: None,
    };

    // Send the prompt request in a separate task and wait for responses concurrently
    let mut prompt_handle = tokio::spawn({
        let cx = cx.clone();
        async move { cx.send_request(prompt_request).block_task().await }
    });

    // Accumulate responses from return_response_to_user calls
    let mut responses = Vec::new();

    // Wait for responses until the prompt completes
    loop {
        tokio::select! {
            // Receive responses from return_response_to_user
            Some(response) = response_rx.recv() => {
                tracing::debug!("Received response from sub-agent");
                responses.push(response);
            }
            // Prompt completed
            result = &mut prompt_handle => {
                let prompt_response = result
                    .map_err(|_| sacp::Error::internal_error())?;
                let PromptResponse { stop_reason, meta: _ } = prompt_response?;
                tracing::info!(
                    "Research complete for session {} (stop_reason: {:?}, {} responses)",
                    session_id,
                    stop_reason,
                    responses.len()
                );
                break;
            }
        }
    }

    // Unregister the session now that research is complete
    state.unregister_session(&session_id);

    // Format and send the accumulated responses
    let final_response = if responses.is_empty() {
        format!(
            "Research completed for crate '{}' but no responses were returned.",
            request.crate_name
        )
    } else if responses.len() == 1 {
        serde_json::to_string_pretty(&responses[0])
            .unwrap_or_else(|_| format!("{:?}", responses[0]))
    } else {
        serde_json::to_string_pretty(&serde_json::json!({
            "responses": responses
        }))
        .unwrap_or_else(|_| format!("{:?}", responses))
    };

    request
        .response_tx
        .send(final_response)
        .map_err(|_| sacp::Error::internal_error())?;

    Ok(())
}

/// Create a NewSessionRequest for the research agent.
fn research_agent_session_request(
    sub_agent_mcp_registry: McpServiceRegistry,
) -> Result<NewSessionRequest, sacp::Error> {
    let cwd = std::env::current_dir().map_err(|_| sacp::Error::internal_error())?;
    let mut new_session_req = NewSessionRequest {
        cwd,
        mcp_servers: vec![],
        meta: None,
    };
    sub_agent_mcp_registry.add_registered_mcp_servers_to(&mut new_session_req);
    Ok(new_session_req)
}
