# Security policy

This repository holds the website and the export API for
[liquid-glass-cli](https://github.com/aryankholqi/liquid-glass-cli) and the
**Liquid Glass Export** Figma plugin, hosted at
`https://liquid-glass-showcase-red.vercel.app`.

## Reporting a vulnerability

Report vulnerabilities privately — please do not open a public issue.

- **Preferred:** [open a private advisory](https://github.com/aryankholqi/liquid-glass-showcase/security/advisories/new)
- **Email:** aryankholqi@gmail.com, with `SECURITY` in the subject

Please include what you found, the steps to reproduce it, and the impact you
believe it has. If a proof of concept touches stored exports, use an export you
created yourself.

## What to expect

| Stage | Target |
| --- | --- |
| Acknowledgement of your report | within 3 business days |
| Initial assessment and severity | within 7 days |
| Fix deployed for a confirmed high-severity issue | within 14 days |
| Fix deployed for lower-severity issues | next release |

You will be kept informed while the issue is open, credited in the advisory
unless you prefer otherwise, and asked to hold off on public disclosure until a
fix is deployed. This project runs no bug bounty and offers no payment.

## Scope

In scope:

- `https://liquid-glass-showcase-red.vercel.app` and its `/api/figma/exports`
  endpoints
- The handling, storage and expiry of exported Figma specs
- This repository's source code

Out of scope:

- Vulnerabilities in Vercel, Upstash or npm themselves — report those to the
  vendor
- Volumetric denial of service, and reports produced only by automated scanners
  with no demonstrated impact
- Missing hardening headers with no exploitable consequence

## How exported data is protected

- All traffic is HTTPS; the plugin manifest allows exactly one origin.
- Exports are stored in Upstash Redis, encrypted in transit and at rest, under a
  key generated with `crypto.getRandomValues` — 12 characters from a
  32-character alphabet (2^60 values), never listed, indexed or sequential.
- Every export carries a 7-day TTL and is deleted automatically on expiry.
  Reading an export neither extends nor shortens it.
- Read and write endpoints are rate limited per IP, and the read endpoint
  validates the ID format before any lookup.
- The service has no accounts, credentials or sessions to compromise.

What an export contains, and what it deliberately does not, is documented in the
[privacy policy](https://liquid-glass-showcase-red.vercel.app/privacy).

## Dependencies

Dependencies are kept current and patched when an advisory affects a package
this project actually uses. Production secrets live in Vercel environment
variables and are never committed.
