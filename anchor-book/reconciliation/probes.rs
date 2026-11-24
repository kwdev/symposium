//! Reconciliation probes; assertions express the Book's guarantees. Run through run-probes.py.
use std::collections::HashMap;
use symposium::predicate::{Predicate, PredicateContext, PredicateEval, ResolvedPredicateEntry};
use symposium_testlib::{TestMode, with_fixture};

#[tokio::test]
async fn disabled_registry_plugin_is_not_active() {
    with_fixture(
        TestMode::SimulationOnly,
        &["chained-crate0"],
        async |mut ctx| {
            ctx.sym.config.plugins.disable = vec!["vouch-plugin".into()];
            let root = ctx.workspace_root.clone().unwrap();
            let ws = ctx.sym.workspace(&root);
            let info = ws.info().await.cloned();
            let registry =
                symposium::plugins::load_registry_with_workspace(&ctx.sym, info.as_ref()).await;
            let target = registry
                .plugins
                .iter()
                .find(|p| p.root.ends_with("vouch-plugin"))
                .unwrap();
            assert!(
                ctx.sym
                    .config
                    .plugins
                    .is_disabled(ws.pms(), &target.canonical)
                    .await
            );
            let deps = ws.dep_ids().await;
            assert!(
                target.applies(&mut PredicateContext::new(deps)),
                "fixture plugin must pass its gate before checking disablement"
            );
            let mut predicates = PredicateContext::new(deps);
            let active = symposium::plugins::active_plugins(
                &ctx.sym,
                &registry,
                ws.pms(),
                Some(&root),
                &mut predicates,
                symposium::UpdateLevel::None,
            )
            .await;
            assert!(
                !active.iter().any(|p| p.root == target.root),
                "disabled registry plugin remains active"
            );
            Ok(())
        },
    )
    .await
    .unwrap();
}

#[tokio::test]
async fn disabled_chained_package_is_not_active() {
    with_fixture(
        TestMode::SimulationOnly,
        &["chained-crate0"],
        async |mut ctx| {
            ctx.sym.config.plugins.disable = vec!["crate-w".into()];
            let root = ctx.workspace_root.clone().unwrap();
            let ws = ctx.sym.workspace(&root);
            let info = ws.info().await.cloned();
            let registry =
                symposium::plugins::load_registry_with_workspace(&ctx.sym, info.as_ref()).await;
            let deps = ws.dep_ids().await;
            assert!(
                deps.iter().any(|p| p.name == "crate-w"),
                "fixture dependency must resolve before checking disablement"
            );
            let mut predicates = PredicateContext::new(deps);
            let active = symposium::plugins::active_plugins(
                &ctx.sym,
                &registry,
                ws.pms(),
                Some(&root),
                &mut predicates,
                symposium::UpdateLevel::None,
            )
            .await;
            assert!(
                !active.iter().any(|p| p.canonical.name == "crate-w"),
                "disabled chained package remains active"
            );
            Ok(())
        },
    )
    .await
    .unwrap();
}

fn entries(
    script: &std::path::Path,
    counter: &std::path::Path,
) -> HashMap<String, ResolvedPredicateEntry> {
    HashMap::from([(
        "probe".into(),
        ResolvedPredicateEntry {
            runnable: symposium_install::Runnable::Script(script.to_path_buf()),
            args: vec![counter.display().to_string()],
        },
    )])
}

#[cfg(unix)]
#[test]
fn zero_time_watch_is_not_reused_in_memory() {
    let dir = tempfile::tempdir().unwrap();
    let counter = dir.path().join("counter");
    let script = dir.path().join("predicate.sh");
    std::fs::write(&script, "echo x >> \"$1\"\necho '{\"watchTime\":0}'\n").unwrap();
    let mut context = PredicateContext::with_custom_predicates(&[], entries(&script, &counter));
    let predicate = Predicate::Custom {
        name: "probe".into(),
        arg: "".into(),
    };
    assert!(predicate.evaluate(&mut context));
    assert!(predicate.evaluate(&mut context));
    assert_eq!(
        std::fs::read_to_string(counter).unwrap().lines().count(),
        2,
        "zero TTL was reused within the context"
    );
}

#[cfg(unix)]
#[test]
fn relative_watch_tracks_the_declared_workspace() {
    let dir = tempfile::tempdir().unwrap();
    let counter = dir.path().join("counter");
    let script = dir.path().join("predicate.sh");
    let cache = dir.path().join("cache.json");
    let watched = "book-reconciliation-watched-file";
    std::fs::write(
        &script,
        format!("echo x >> \"$1\"\necho '{{\"watchFile\":\"{watched}\"}}'\n"),
    )
    .unwrap();
    let predicate = Predicate::Custom {
        name: "probe".into(),
        arg: "".into(),
    };
    let make_context = || {
        PredicateContext::with_custom_predicates(&[], entries(&script, &counter))
            .with_cwd(Some(dir.path()))
            .with_disk_cache(&cache)
    };
    let mut first = make_context();
    assert!(predicate.evaluate(&mut first));
    first.persist_disk_cache(&cache).unwrap();
    std::fs::write(dir.path().join(watched), "now present").unwrap();
    let mut second = make_context();
    assert!(predicate.evaluate(&mut second));
    assert_eq!(
        std::fs::read_to_string(counter).unwrap().lines().count(),
        2,
        "workspace file appearance did not invalidate the cache"
    );
}
