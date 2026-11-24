# Introduction

This is Symposium's Anchor Book: the definition of the system Symposium is
building, kept for the engineers and agents who develop it. It describes the
design, the requirements and decisions that govern it, and anchors: properties
that must hold in the built system, each with the criteria that verify it. Its
implementation roadmaps organize the agreed work toward that goal.

This branch maintains only the Anchor Book. Symposium's
[user documentation](https://symposium-dev.github.io/symposium/) and its source
Book remain upstream. Design and governing material are adapted semantically
from pinned upstream revisions, one area at a time, without a local `md/` copy.

## Reading this Book

[Working on Symposium](working-on-symposium.md) identifies the phase, sources,
authoring references, and commands for working with this Book.

- [Design](design/index.md) defines the intended system.
- [Authority](authority/index.md) records the governing requirements and decisions.
- [Implementation Roadmaps](implementation-roadmaps/index.md) organize agreed work,
  with completion criteria and evidence.

## Current state

The Book now has a [system architecture](design/system.md) and capability designs
covering configuration, plugins, activation, delivery, agents, hooks, MCP,
commands, telemetry, and evaluation. The governing records are drafts.
The [source coverage](implementation-roadmaps/source-coverage.md) distinguishes
this architectural migration from remaining detailed conversion, unresolved
source proposals, and verification work.
