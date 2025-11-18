//! Benchmark harness for testing rust-crate-sources-proxy research quality.
//!
//! Runs a research prompt through the proxy + Claude Code, then validates
//! the response against expected results using another Claude Code instance.

use anyhow::Result;
use sacp::{ByteStreams, Component, DynComponent};
use sacp_conductor::conductor::Conductor;
use sacp_tokio::AcpAgent;
use std::str::FromStr;
use tokio::io::duplex;
use tokio_util::compat::{TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .init();

    tracing::info!("Symposium benchmark starting");

    // Define test prompt and expected behavior
    let research_prompt = "Please use the rust_crate_query tool to research the signature of the \
         serde_json::from_value API and describe what inputs it accepts";

    let expected_result = "The response should describe that serde_json::from_value takes a \
         serde_json::Value and deserializes it into a type T. It should mention \
         that it returns a Result<T, Error>.";

    tracing::info!("Running research prompt");

    // Create components: rust-crate-sources-proxy + Claude Code
    let proxy = symposium_crate_sources_proxy::CrateSourcesProxy;
    let claude_agent = AcpAgent::from_str("npx -y '@zed-industries/claude-code-acp'")?;

    // Create duplex streams for editor <-> conductor communication
    let (editor_write, conductor_read) = duplex(8192);
    let (conductor_write, editor_read) = duplex(8192);

    // Spawn conductor with proxy + agent chain
    let conductor_handle = tokio::spawn(async move {
        Conductor::new(
            "benchmark-conductor".to_string(),
            vec![DynComponent::new(proxy), DynComponent::new(claude_agent)],
            None,
        )
        .run(ByteStreams::new(
            conductor_write.compat_write(),
            conductor_read.compat(),
        ))
        .await
    });

    // Send prompt using yopo
    let response = yopo::prompt(
        ByteStreams::new(editor_write.compat_write(), editor_read.compat()),
        research_prompt,
    )
    .await?;

    tracing::info!("Research response received: {} chars", response.len());

    // Validate response using another Claude Code instance
    tracing::info!("Validating response");

    let validator_agent = AcpAgent::from_str("npx -y '@zed-industries/claude-code-acp'")?;
    let (validator_write, validator_read) = duplex(8192);
    let (validator_out_write, validator_out_read) = duplex(8192);

    let validator_handle = tokio::spawn(async move {
        validator_agent
            .serve(ByteStreams::new(
                validator_out_write.compat_write(),
                validator_read.compat(),
            ))
            .await
    });

    let validation_prompt = format!(
        "Compare this response to the expected result and respond with PASS or FAIL. \
         If FAIL, explain what's missing.\n\n\
         Expected: {}\n\n\
         Actual response:\n{}",
        expected_result, response
    );

    let validation_result = yopo::prompt(
        ByteStreams::new(validator_write.compat_write(), validator_out_read.compat()),
        &validation_prompt,
    )
    .await?;

    println!("\n=== VALIDATION RESULT ===");
    println!("{}", validation_result);
    println!("========================\n");

    // Clean up
    validator_handle.await??;
    conductor_handle.await??;

    Ok(())
}
