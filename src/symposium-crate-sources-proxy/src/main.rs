//! Symposium Crate Sources Proxy - Main entry point

use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    symposium_crate_sources_proxy::run().await
}
