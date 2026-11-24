# Package Audits and Revocation

Audits provide evidence about published package content. They are independent of
plugin discovery and consent: an audited dependency remains disabled until the
user's policy enables it, and an enabled package can still be revoked.

## Anchors

> **`A-audit-revocation`** (draft): **Revoked content cannot execute through another activation route**
> Property: A recognized Cargo-package revocation blocks that package across direct dependency, explicit use, automatic enablement, and registry-chained routes before its predicates or capabilities execute; an audit never supplies user consent. Registry definitions and workspace-owned plugins are separate trust roots, outside package-audit scope.
> Authority: `R-enforce-revocation`; `R-explicit-plugin-consent`
> - Criterion `revocation-before-execution` [test]: Use revoked Cargo-package fixtures with marker-writing predicates, installations, and hooks across each package activation route, plus distinct registry/workspace trust-root controls; assert no marker is produced and no capability is exposed.
> - Criterion `audit-is-not-consent` [test]: Present audited, unaudited, missing-list, and malformed-list states for unconsented dependencies; assert none is enabled by its audit answer.

> **`A-audit-payload-identity`** (draft): **An audit digest covers the complete eligible package payload**
> Property: Only fully readable, bounded, in-package payloads can obtain a digest; changes in auditable content change the framed identity, and unsupported content is ineligible rather than partially hashed.
> Authority: `R-package-boundaries`; `D-content-audit-identity`
> - Criterion `content-and-framing` [test]: Change manifest bytes, normalized metadata, file names, and skill bytes independently; assert expected digest changes and stable identity under traversal-order changes.
> - Criterion `ineligible-inputs` [test]: Exercise external sources, escapes, broken or cyclic symlinks, unreadable and special files, and size limits; assert no eligible digest or favorable digest audit is returned.


## Audit sources and answers

Configured audit lists are separate from plugin registries and trust roots.
No usable list means no audit answer; a missing package entry means not audited.
Neither condition makes plugin discovery incomplete. A fetch failure can use
cached information but cannot manufacture a favorable audit.

An audit can identify a package version or a content digest. Version revocations
are checked first; compute a digest only when the answer requires it. List parsing
can ignore unknown fields and reject malformed entries with diagnostics.
An unknown format is not interpreted using an older schema.

## Digest identity

The digest identifies the auditable plugin payload: the manifest, canonicalized
package metadata, and the relevant in-package skill files. Hash inputs use stable
ordering and explicit framing so file boundaries and names are unambiguous.
Resource limits bound work.

External git or path content, paths outside the package, unknown file types,
broken links, cycles, or unreadable input make the payload ineligible for the
digest scheme. An ineligible package cannot inherit the audit of a partial hash.
Memoization lasts only for the invocation; a cached answer must not conceal
content changes across invocations.

## Revocation enforcement

Activation checks Cargo-package revocation on direct, explicit, automatic, and
chained package routes before running package-controlled gates or commands.
A registry or workspace definition is a trust root rather than an audited package;
a same-named Cargo revocation does not revoke that definition.
Delivery uses retained ownership information to remove revoked content even
when general stale cleanup is held back by another failing source.

The audit identity must include its ecosystem. The audit protocol here covers Cargo packages. Other ecosystems require an
explicit audit-policy extension; an unsupported package must not be presented
as audited by inference.
