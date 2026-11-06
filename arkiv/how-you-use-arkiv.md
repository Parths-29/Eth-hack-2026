# How Redress uses Arkiv

The frontend now includes a direct, read-only Arkiv SDK adapter in `web/src/lib/arkiv-client.ts`, called through `data-service.ts`. In live mode it queries Rabdi, restricts ownership to the configured trusted attestor, filters verdict entities by borrower, and validates the decoded JSON before rendering it.

Installed SDK v1 uses indexed `type`/`user` string attributes and a `record` bytes attribute for full JSON, rather than the PRD's old payload sketch. See `shared/ADAPTER.md`. Default mode is synthetic. The SDK path and failure behavior are implemented, but no real publisher/entities are configured in this branch. Sponsor eligibility requires a successful real, user-visible query and separately verified publisher writes; installing the SDK alone is insufficient.
