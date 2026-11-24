use anyhow::bail;

fn main() -> anyhow::Result<()> {
    let mut args = std::env::args().skip(1);
    match args.next().as_deref() {
        Some("agent-eval") => symposium_eval::run(args),
        Some(cmd) => bail!("unknown xtask command: {cmd}"),
        None => bail!(
            "usage: cargo xtask <command>\n\ncommands:\n  agent-eval         Evaluate agent tasks with and without Symposium"
        ),
    }
}
