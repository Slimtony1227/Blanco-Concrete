# Review section: implementation and reuse guide

Documented October 23, 2026; updated October 26, 2026, for Blanco's Concrete Paint & Maintenance Service.

## Latest hosted setup status — October 26, 2026

The complete website and review backend are live on
https://blancosconcretepaintandmaintenance.com. Production version:
`050c56fd-8888-4438-82ca-6f65c86917db`.

The production deployment includes the D1 database connection, migrated reviews
table, encrypted `TURNSTILE_SECRET_KEY`, matching public site key, submission
rate limit, and Cloudflare Access protection. The widget allows the exact
production domain. Public reviews are enabled and local mode is disabled.
The owner is the only review administrator; no client access was added.

Live checks passed:
- Home, About, and Contact load with their prepared page titles and metadata.
- `/sitemap.xml` returns XML listing three public pages; `/robots.txt` returns
  plain text and excludes admin and API paths from crawling.
- Public review reads connect to D1. Missing authentication redirects both the
  admin page and admin API to Cloudflare Access.
- An invalid verification token is rejected without saving a review.
- A real browser submission passed Turnstile and appeared only in the private
  pending list. The existing signed-in administrator session could approve it;
  the public API then showed it. Rejecting it removed it from public results.
- D1 now contains one clearly labeled deployment test, status `rejected`.
  There are no published reviews. No customer testimonials were fabricated.

The existing 56 automated checks passed during preparation, and the final build
passed before deployment. A real-token replay was not separately exercised in
production; the automated spam tests cover rejection of expired/reused tokens.
Lint retains the existing LanguageContext fast-refresh warning.

The full code was deployed directly with the project-local Wrangler using
`wrangler.production.jsonc`. Source changes are still local and uncommitted;
GitHub `main` has not received them. Its automatic build watches `main`, runs
`npm run build`, and now deploys with `--config wrangler.production.jsonc`.
Sync the prepared source before relying on the next automatic build.
Google Search Console sitemap submission and indexing requests remain pending.

Setup history: the original assets-only deployment could not accept runtime
variables in the dashboard. An intermediate server version preserved its assets
and kept reviews disabled while the owner saved the rotated secret privately.
A reported CLI secret-write success was not trusted until the binding was
verified through Cloudflare. The final deployment preserved that secret.
No secret value is recorded in source or documentation.

Earlier dated implementation notes below are historical; this status supersedes
statements that production setup or deployment is unfinished.

## What we built

A review section directly on the website, below the service areas and green
quote button. Customers submit a display name, a rating from 1 to 5, and a
written review. The website owner checks each submission before publishing it.
Visitors do not need accounts. The developer manages approvals for the client.

**Current status: deployed and live-tested.** Local development remains available
with an isolated local database. Production requires Cloudflare Access for
administration and Turnstile plus submission limits for public submissions.
See the latest hosted setup status above for validation details and remaining
source-sync and Search Console work.

This is first-party website feedback. It does not post reviews to Google or
other platforms. The separate metadata and Organization JSON-LD work is not
required for the review system to function.

## Technology stack

| Technology | Its job in this project |
| --- | --- |
| React | Builds the form, review cards, and administration screen. |
| React Router | Shows the administration screen at `/admin/reviews`. |
| Tailwind CSS | Styles the cards, form, buttons, and mobile layout. |
| Vite | Builds the website into the `dist` folder. |
| Cloudflare Worker | Runs the server code that checks submissions, reads reviews, and approves or rejects them. |
| Cloudflare D1 | Stores review records using SQL, a language for reading and changing database data. Locally, Wrangler supplies a local database. |
| Wrangler | Cloudflare's development command-line tool. It starts the local Worker and manages the database setup. |
| jose 6.2.13 | Verifies Cloudflare Access token signatures, issuer, audience, and expiry inside the Worker. |
| Node.js | Runs the startup script and automated tests on the computer. |
| npm | Installs project packages and runs shortcuts such as `npm start`. |
| Browser `fetch` | Sends requests between the React interface and Worker; no extra request library is used. |
| Git and GitHub | Store source-code history. They do not store the local database or private access key. |

The project currently declares React 19, React Router 7, Tailwind 4, and Vite 8.
Wrangler is pinned to version 4.147.0. `package-lock.json` records exact installed
dependency versions. For reuse, check the destination project's compatible
versions rather than treating these versions as permanent requirements.

## How the parts communicate

```text
Customer opens the website
  -> React requests published reviews from the Worker
  -> Worker reads approved records from D1
  -> React displays the review cards

Customer submits the form
  -> Worker validates the submission
  -> D1 saves it with status pending
  -> Customer sees a confirmation; review is not public yet

Administrator signs in locally
  -> Worker checks the access key
  -> Administrator sees pending reviews
  -> Publish changes the record to approved
  -> Visitors see it the next time they load or refresh the review section
```

The form uses the same website address as the Worker, with paths beginning
with `/api/`. An API is the set of addresses the interface calls to request
data or perform an action. Customers never connect directly to D1.

## How we assembled it

1. Defined a review record and three states: pending, approved, and rejected.
2. Added a numbered SQL setup file to create the table and its lookup index.
3. Connected the local Worker to D1 using the name `DB`.
4. Added public request handlers for reading approved reviews and submitting
   new ones. The server always chooses pending for new submissions.
5. Added protected administration handlers for listing and changing reviews.
6. Built reusable review cards, the public form, and the administration page.
7. Added Spanish and English interface text to the existing language system.
8. Added one startup command to build the site, prepare storage, and start
   the Worker with the website files.
9. Verified the review lifecycle and access boundaries with automated tests,
   and checked the interface manually on desktop and mobile during development.

## Files and responsibilities

All paths below are relative to the project root. In this project that root is
`/Volumes/SANDISKO/DavidNC`. The older `dev/blanco-site` folder is not the active
site and should not be copied as part of this feature.

| File | Responsibility |
| --- | --- |
| `src/components/Reviews.jsx` | Public form, loading/error/empty states, approved list, and View more button. |
| `src/components/ReviewCard.jsx` | Shared card displaying stars, comment, name, and submission date. |
| `src/pages/ReviewAdmin.jsx` | Local sign-in and Pending, Published, and Rejected lists with moderation buttons. |
| `src/content/reviews.js` | English and Spanish review interface text. |
| `src/context/LanguageContext.jsx` | Makes those translations available to components. |
| `src/pages/Home.jsx` | Places `<Reviews />` below the service areas. |
| `src/App.jsx` | Registers the `/admin/reviews` route. |
| `worker/index.js` | Validation, access checks, database reads/writes, and website file serving. |
| `worker/access.js` | Validates production settings and checks signed Cloudflare Access tokens using cached public keys. |
| `migrations/0001_reviews.sql` | Creates the reviews table and index. |
| `wrangler.local.jsonc` | Connects the local Worker, website build, and local D1 database. |
| `wrangler.production.jsonc` | Online resource connections and rate limiter; keys, database migration, and hosted checks still required. |
| `scripts/start-local.mjs` | Generates a local key if needed, builds, applies database changes, and starts the server. |
| `scripts/reviews.test.mjs` | Checks submissions, publication, retained records, pagination, and access restrictions. |
| `src/lib/adminRequests.js` | Sends administrator requests with the appropriate credentials and detects expired sessions. |
| `scripts/admin-requests.test.mjs` | Checks browser request options, local keys, redirects, expired sessions, and network errors. |
| `src/components/ReviewChallenge.jsx` | Loads the official Turnstile widget and handles expired or failed checks. |
| `worker/spam.js` | Checks production readiness, applies submission limits, and verifies Turnstile tokens. |
| `scripts/spam.test.mjs` | Tests hosted submissions and failure cases using simulated Cloudflare responses. |
| `scripts/access.test.mjs` | Uses real temporary signatures to test production authentication without touching the live account or database. |
| `package.json` | Defines commands and dependencies. |
| `.gitignore` | Excludes database files, credentials, installed packages, and build output from Git. |
| `LOCAL-DEVELOPMENT.md` | More detailed local setup and troubleshooting reference. |

## Database design and review history

Each row in the `reviews` table is one submission:

| Field | Meaning |
| --- | --- |
| `id` | Automatically assigned record number. |
| `submission_id` | Unique browser-generated identifier that prevents inserting the same submission twice on a retry. |
| `display_name` | Public name; 2–60 characters after trimming spaces. |
| `rating` | Whole number from 1 to 5. |
| `comment` | Review text; 10–2,000 characters after trimming spaces. |
| `status` | `pending`, `approved`, or `rejected`; defaults to pending. |
| `created_at` | Submission time, stored in UTC. |
| `moderated_at` | Time of the latest status change. |

The database also enforces the length, rating, and status constraints.
An index on status and record number helps retrieve reviews by status,
newest first. Lists return six reviews at a time. The `before` value asks for
records older than the last one displayed.

| Administrator action | Stored status | Publicly visible? |
| --- | --- | --- |
| New submission | `pending` | No |
| Publish | `approved` | Yes |
| Reject | `rejected` | No |
| Return to pending | `pending` | No |

Rejecting or unpublishing keeps the record. The interface has no permanent
delete or text-edit action. This preserves a collection of past submissions,
**not a full audit trail**: only the current status and latest moderation time
are stored, not every earlier action or the identity of each moderator.

## Run it locally

Open a terminal in the project folder and run:

```bash
npm start
```

`npm` is the project package tool; `start` selects the startup shortcut in
`package.json`. There are no extra flags in this command.

On a fresh checkout with Node.js and npm already installed, run `npm ci` first.
`ci` installs the exact dependencies in the lockfile and replaces an existing
`node_modules` folder. For a different project, review its dependencies before
installing anything.

Startup does the following:

1. Creates `.dev.vars` with a random `LOCAL_ADMIN_TOKEN` if no token exists.
2. Runs Vite to build the website into `dist`.
3. Runs this project's metadata build step. That step is separate from reviews.
4. Applies any database setup files that have not already been applied.
5. Starts the Worker and website at `http://127.0.0.1:8787`.

The first database setup may ask for confirmation; answer `y` to apply it.
Later starts skip setup files already recorded as applied. They do not clear
existing reviews. Keep the terminal running; Control+C stops the server.
After editing frontend files, restart `npm start` to rebuild them.

`npm run dev:local` runs the same startup. Here, `run` selects a named script and
`dev:local` is its name. `npm run dev` starts Vite alone and does not start the
review backend or local database.

## Submit, approve, and view a review

1. Visit `http://127.0.0.1:8787/#reviews`.
2. Select **Leave a review / Deja tu reseña**, fill in the form, and submit.
3. Visit `http://127.0.0.1:8787/admin/reviews`.
4. Open `.dev.vars` in your editor. Copy only the value after
   `LOCAL_ADMIN_TOKEN=`. Do not copy the variable name or share the value.
5. Paste it into the access-key field and select **Sign in / Entrar**.
6. Find the review under **Pending / Pendientes**.
7. Select **Publish / Publicar**.
8. Reload the homepage to see the published review.

The key is held only in browser memory. Refreshing the administration page
requires signing in again. This local key is a development convenience, not
the public-site Cloudflare Access login.

The interface supports English and Spanish; review text remains in the
customer's original language. Dates follow the selected interface language.
There is no automatic live refresh or email notification system.

## Worker request reference

`GET` reads data, `POST` submits a new record, and `PATCH` changes part of an
existing record. JSON is the text format used to exchange the data.

| Method and path | Purpose | Access |
| --- | --- | --- |
| `GET /api/health` | Checks the database connection. | Local |
| `GET /api/reviews` | Lists approved reviews only. | Local visitor |
| `POST /api/reviews` | Saves a valid submission as pending. | Local visitor |
| `GET /api/admin/reviews?status=pending` | Lists a selected moderation state. | Local key or verified hosted Access session |
| `PATCH /api/admin/reviews/:id` | Changes the review's status. | Local key or verified hosted Access session |

`:id` means the actual record number. `?status=pending` filters the list;
`approved` and `rejected` are also accepted. `before` can be added to list
requests to retrieve older records. Responses include `reviews` and `next`;
`next: null` means there are no more records in that list.

The submission body contains `name`, `rating`, `comment`, and `submissionId`.
The moderation body contains `status`. Administration requests use an
`Authorization: Bearer ...` header: a private key attached to the request,
not included in the URL. Changing requests also require an `Origin` header
matching the website address; normal browser requests supply it.

## Checks already built in

- Local testing requires both `LOCAL_REVIEW_MODE=true` and a local hostname.
- In local mode the Worker checks the administrator key before reading private
  lists or changing a review's status. Production never accepts that key.
- Production uses `LOCAL_REVIEW_MODE=false` and the configured Access identity.
  HTTPS and the exact allowed hostname are required; nonstandard ports are refused.
  Administrator pages and API requests require a valid signed token.
- The Worker checks name, comment, rating, and submission identifier values.
- Request bodies must be JSON and cannot exceed 16 KiB (16,384 bytes).
- Database queries use bound values: customer text is supplied as data rather
  than pasted into database instructions.
- React displays customer comments as text, not executable HTML.
- A customer cannot publish a review by sending an approved status in the form.
- Reusing a submission identifier does not create another row. This prevents
  ordinary retry duplicates; it is not spam protection or customer verification.
- API responses use `Cache-Control: no-store`, asking caches not to keep them.
- The key is not bundled into the public website or kept in browser storage.

## Local configuration and command flags

`wrangler.local.jsonc` is JSON that allows explanatory comments.

| Setting | Meaning |
| --- | --- |
| `name` | Local Worker's name. |
| `main` | Worker entry file: `worker/index.js`. |
| `compatibility_date` | Selects the Cloudflare runtime behavior date. |
| `workers_dev: false` | Disables a workers.dev address; by itself this does not prevent deployment. |
| `vars.LOCAL_REVIEW_MODE` | Enables the prototype, together with the hostname check. |
| `assets.directory` | Folder containing the built website, `dist`. |
| `assets.binding: ASSETS` | Name the Worker uses to serve those website files. |
| `not_found_handling` | Lets the React application handle page addresses. |
| `run_worker_first` | Sends `/api` and `/api/*` through the Worker first; `*` matches the remaining path. |
| `d1_databases` | Database connection settings. |
| `binding: DB` | Makes the database available to code as `env.DB`. |
| `database_name` | Local database name, `blanco-reviews-local`. |
| `database_id` | A placeholder for this local prototype, not a real hosted database ID. |
| `migrations_dir` | Folder of numbered database setup/change files. |
| `remote: false` | Uses local database storage during development. |

The startup script invokes these Wrangler operations through the installed
Node.js executable; their equivalent Wrangler command forms are:

```text
wrangler d1 migrations apply blanco-reviews-local --config wrangler.local.jsonc --local
wrangler dev --config wrangler.local.jsonc --local --ip 127.0.0.1 --port 8787
```

- `d1` selects database operations.
- `migrations apply` runs unapplied numbered database changes.
- `blanco-reviews-local` selects the configured database.
- `dev` starts the development server.
- `--config` chooses the configuration file that follows it.
- `--local` runs locally instead of using hosted resources.
- `--ip 127.0.0.1` listens only on this computer.
- `--port 8787` selects the connection number in the local URL.

Use `npm start` for the complete workflow; a global Wrangler installation is
not required. The startup script uses the copy installed in this project.

## Storage and troubleshooting

Local reviews are saved under `.wrangler/state`. They survive server restarts,
but deleting that folder removes local storage. `.dev.vars` stores the local
access key. Both are ignored by Git. Copying only the source code to another
computer does not copy reviews or credentials.

| Symptom | Check |
| --- | --- |
| Reviews fail to load | Start with `npm start`, not Vite alone; check terminal errors. |
| Submission is missing from homepage | It may still be pending. Publish it and refresh the homepage. |
| Pending list is empty | Check Published and Rejected, or submit a test review. |
| Access key rejected | Copy the value from this active project's `.dev.vars`, not an older nested project. |
| Signed out after refreshing | Expected: the key stays only in memory. |
| Changes do not appear | Restart `npm start` so the frontend is rebuilt. |
| Port is already occupied | Stop the earlier local server before starting another one. |

`npm run db:check` counts all stored reviews, including pending and rejected
ones. It runs `wrangler d1 execute` with `--config`, `--local`, and
`--command "SELECT count(*) AS reviews FROM reviews"`. `execute` runs database
instructions; `--command` supplies the SQL; this query only reads a count.

## Verification process

With the local server running, use a second terminal:

```bash
npm run test:reviews
npm run build
npm run lint
```

`run` selects a named package script. `test:reviews` runs the local integration
tests using Node's `--test` flag, which enables its built-in test runner.
`build` generates the deployable website files; `lint` checks code for likely
mistakes. These commands do not deploy anything.

The review tests cover database connectivity, existing pages, invalid and
cross-origin submissions, administrator access, pending isolation, attempted
approval spoofing, retry duplicates, publication/unpublication/rejection,
retained records, pagination, and refusal of hosted requests. They create
temporary reviews and clean up their own records. Run them only against the
local test environment.

For manual verification, submit a review, confirm it is hidden before approval,
publish it, refresh the homepage, unpublish it, and confirm it disappears.
Restart the server and confirm the record still exists. Check both languages,
mobile layout, keyboard navigation, long comments, and error messages.

## Reuse in another project

1. Confirm the destination project's framework, hosting, and approval needs.
   The React components can be adapted; the database design and moderation
   workflow can be reused even with a different frontend.
2. Copy the review components, administration page, translations, Worker,
   migration, tests, and local configuration from the file list above.
3. Add the section to the destination page and register the administration
   route. Connect the translations or replace `useLang` with that project's
   text system.
4. Adapt Tailwind theme names such as `navy`, `light-gray`, `dark-text`,
   `font-body`, and `font-heading` to the destination design.
5. Merge package scripts and dependencies with the existing project; do not
   replace its entire `package.json` or startup configuration blindly.
6. Change the Worker/database names and build output folder as needed. Keep
   `DB` and `ASSETS` consistent between the Worker and configuration.
7. Adapt the startup script. Its metadata build step belongs to this website;
   copy that separate feature only if wanted, or omit that step in the new project.
8. Keep credentials and local database folders out of Git. Generate a fresh
   local access key instead of copying this project's `.dev.vars`.
9. Start with an empty local database, run the tests, and complete the manual
   submission and approval walkthrough.
10. Complete the production work below before accepting real public reviews.

This version assumes one business per deployment. If multiple businesses share
one database, add business identifiers and enforce separation in every read
and write; simply changing the name on the page is not enough.

## Production token verification (implemented locally)

Cloudflare Access handles the email-code login. It passes a signed login token
in the `Cf-Access-Jwt-Assertion` request header. The Worker uses `jose` to verify
the signature with public keys from the configured team's
`/cdn-cgi/access/certs` endpoint. The token cannot choose a different key URL.

The verification options are:

- `issuer`: must match `TEAM_DOMAIN`, the configured Cloudflare Access organization.
- `audience`: must match `POLICY_AUD`, this specific Access application.
- `algorithms: ['RS256']`: accepts Cloudflare's expected signature algorithm only.
- `requiredClaims`: requires issuer, audience, expiry (`exp`), and subject (`sub`).
  The subject identifies the authenticated user. Expired tokens are refused;
  a future `nbf` value (not valid before this time) is also checked when present.
- `timeoutDuration: 5000`: waits at most five seconds for a public-key fetch.

Public keys are cached in memory by jose with bounded freshness and refresh
behavior for key rotation. This cache contains public keys, not user sessions.
Verification failures deny access without logging the token or its contents.
The Cloudflare Access policy still controls which users may obtain a token.

Both `/admin` pages and `/api/admin` requests are checked, including subpaths,
capitalization differences, and encoded paths. Private page responses use
`Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`. Changing requests
still require a matching Origin. A local key, email header, or cookie alone
cannot substitute for the verified assertion header in production.

`npm run test:access` runs `node --test scripts/access.test.mjs`:
`run` selects the package script and `--test` enables Node's test runner.
The tests generate temporary signing keys and simulate Cloudflare's public-key
response. They check valid access, invalid signatures and claims, expired or
missing tokens, unavailable keys, hostname restrictions, page protection,
cross-origin moderation, and local-mode isolation. They do not prove that the
live email policy, login screen, or hosted database is working.

The library was installed with `npm install --save-exact jose`: `install` adds
the package and `--save-exact` records version 6.2.13 without a version range.
On October 24, npm audit reported six high-severity affected packages in the
existing Vite/Wrangler toolchain and related dependencies; none listed jose.
Those toolchain updates remain separate work before release.

## Administrator screen: local and hosted sign-in

The same screen supports two workflows:

- On `localhost`, `127.0.0.1`, or `[::1]`, enter the local test key as before.
  The key stays in memory and is sent only for local administration requests.
- On the live hostname, Cloudflare handles sign-in before serving the page.
  The screen loads pending reviews using the existing browser session. It does
  not ask for the local key, read the login token, or store it in browser storage.

The hostname check selects the interface only. The Worker still independently
verifies every administrator request; changing the screen cannot grant access.

The request helper uses `credentials: 'same-origin'` to send cookies only to
this website. `X-Requested-With: XMLHttpRequest` tells Access this is a background
request, so an expired session can receive a 401 response. `redirect: 'manual'`
prevents the helper from following a login redirect as if it were review data.
401/403 responses, redirects, and unexpected login HTML clear the private list
and show **Sign in again**. That link performs a full page navigation through
Access. Network/server failures show an error and allow refresh or sign-in;
they are not assumed to mean the session expired. Failed moderation actions
are never automatically replayed after login.

Hosted **Sign out** opens `/cdn-cgi/access/logout`, Cloudflare's logout address.
Cloudflare documents that this signs the user out across the organization's
Access applications, not just this review screen. The screen explains this
before the action. Local sign-out only clears the in-memory key and reviews.

`npm run test:admin` runs `node --test scripts/admin-requests.test.mjs`.
`run` selects the package script and `--test` enables Node's built-in test
runner. Its 11 checks use fake responses and do not connect to Cloudflare.
The existing 22 authentication checks and 7 local review integration checks
also passed. Build passed; lint has only the existing LanguageContext warning.
A temporary browser preview with fake data confirmed hosted loading,
publication, tab switching, the logout destination, and expired-session handling
in both languages. The local browser form also correctly refused an invalid key.
These simulations do not prove the real email login or online database works.

References: [Access session management](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/).

## Production spam protection and live setup

Implemented October 24, 2026. No additional npm package was added. The form
loads Cloudflare's official Turnstile script only when a hosted review form
needs it. `/api/reviews/config` returns the public site key and whether a
challenge is required; it never returns the secret. Local mode returns
`turnstileRequired: false`, so `npm start` still needs no Cloudflare account.

The browser sends the verification token with the review. Before inserting a
row, the Worker calls Cloudflare Siteverify with the encrypted secret, token,
and Cloudflare-provided visitor IP. It requires success, the configured website
hostname, and action `review-submit`. Missing, oversized, expired, reused, or
invalid tokens are refused. Provider errors fail closed. Private tokens, review
text, and secrets are not logged by the error handler. The browser requests a
fresh challenge after every submission attempt and keeps the text on failure.

`REVIEW_SUBMISSIONS` limits attempts to approximately 5 per 60 seconds per IP
at each Cloudflare location. It runs before challenge validation or database
writes. Cloudflare's counters are approximate and do not enforce a strict
worldwide quota. Shared connections share this allowance. A rejected request
returns HTTP 429 and `Retry-After: 60`; the form asks the visitor to wait a minute.
The rate-limit `namespace_id` is a counter group identifier, not a secret; this
project uses `2026102401`. Keep it unique to this use within the account.

`PUBLIC_REVIEWS_ENABLED` remains `"false"`. Even if switched to `"true"`, public
hosted endpoints refuse requests unless the site key, secret, and rate-limit
binding are present. The authenticated administration routes remain separate.

### What the site owner must supply

Update October 24: the owner supplied the public site key, which is now saved
as `TURNSTILE_SITE_KEY` in `wrangler.production.jsonc`. The latest Wrangler
account check still reports no authenticated CLI session. Secret installation,
hosted database setup, and deployment remain pending; public reviews stay disabled.

1. Open the account's Turnstile page, select **Add widget**, name it **Blanco
   website reviews**, and add `blancosconcretepaintandmaintenance.com` as the
   hostname. Choose **Managed** mode and leave pre-clearance off. Share only
   the public site key for `TURNSTILE_SITE_KEY` in the production configuration.
2. Sign Wrangler into the account using `npx wrangler login`. `npx` runs the
   installed project command and `login` opens account authorization. This does
   not deploy. The read-only `wrangler whoami` check found no CLI login on
   October 24; dashboard sign-in alone does not sign in Wrangler.
3. Once signed in, store the widget secret directly using:

   ```bash
   npx wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.production.jsonc
   ```

   `secret put` saves an encrypted Worker setting and prompts for its value;
   `TURNSTILE_SECRET_KEY` is the exact setting name the Worker expects.
   `--config` selects the production configuration. This changes the live
   Worker's secret settings; do not put the secret in Git, the public site-key
   field, or chat. Never use a `VITE_` variable for this secret because Vite's
   frontend variables are visible to website visitors.

Before publishing, inspect the Access allow policy and hosted database, apply
its migration, and review the GitHub build/deploy settings. The live Worker
currently follows GitHub main; a manual feature deployment could otherwise be
replaced by the next main build. Preserve a rollback version, enable the public
switch only when settings and tables are ready, then deploy the reviewed build.
Hosted checks must include email sign-in, denied unauthenticated admin requests,
wrong-host rejection, challenge validation, pending submission, publication,
and public display. Test reviews should be clearly labeled and rejected after
the test. Do not present them as customer testimonials.

Validation for this code change: 16 spam-protection tests, 22 authentication
checks, 11 administrator request tests, and 7 local integration checks passed.
Build and production configuration dry-run passed. Lint reports the existing
LanguageContext warning. Actual hosted widget, email login, and online database
behavior remain unverified until deployment.

`npm run test:spam` runs `node --test scripts/spam.test.mjs`; `--test` selects
Node's built-in runner. No live Cloudflare account or real review data is used.
The configuration check used `wrangler deploy --config wrangler.production.jsonc
--dry-run --outdir /tmp/blanco-spam-check`: `--dry-run` compiles without uploading
or publishing, and `--outdir` chooses the temporary bundle output directory.

Sources: [widget setup](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/),
[server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/),
[rate-limit behavior](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

## Remaining work before going live

The production configuration has now been prepared locally. Its `TEAM_DOMAIN`,
`POLICY_AUD`, and `ALLOWED_HOSTNAME` values are enforced by the Worker.
`LOCAL_REVIEW_MODE: "false"` selects production verification. Public hosted review
endpoints still return 503 while PUBLIC_REVIEWS_ENABLED is false or protection
settings are missing; authenticated
administrator handlers can run, but require the hosted database table.
`assets.run_worker_first: true` sends every production request through the Worker
before serving files so alternate hosts and encoded admin paths cannot skip it.
This means production static requests also invoke the Worker; local routing is unchanged.
`workers_dev: false` and `preview_urls: false` will disable the corresponding
alternate URLs on deployment, not when the file is saved. The custom-domain
route matches the current live domain. `remote: false` keeps development local
and does not prevent a later deployment from connecting to hosted D1.

Use `npm start` for local development as before. No deploy shortcut or GitHub
build setting was changed. No production secrets belong in this JSONC file.

Configuration verification passed with Wrangler's `deploy --dry-run` command.
`--config wrangler.production.jsonc` selects this file; `--dry-run` compiles
and checks without uploading or deploying; `--outdir` selects the temporary
folder for the generated bundle. The check used `/tmp/blanco-production-config-check`.
`WRANGLER_LOG_PATH` directed logs to a temporary file and
`WRANGLER_SEND_METRICS=false` disabled tool usage telemetry for this check.
This validates configuration and bundling, not live authentication or database
connectivity. The next code changes and hosted tests are still required.

1. Inspect the existing Cloudflare application, GitHub deployment branch, and
   domain connection so the feature is deployed to the correct project.
2. The hosted D1 database and separate production configuration now exist.
   Apply the database migration there when ready; local test rows do not
   automatically become production reviews.
3. The administration screen and server-side verification now support Access.
   Verify the actual Access policy, email login, session expiry, and logout
   after deployment; local simulations cannot verify Cloudflare configuration.
4. Turnstile and submission rate limiting are implemented. Create the live
   widget, set its public key and encrypted secret, and verify it on the domain.
5. Keep production secrets in Cloudflare's secret settings, not frontend code
   or Git. Preserve local testing as a separate configuration.
6. Enable public hosted review endpoints only after spam protection is in place.
   Continue checking administrator authentication and allowed hosts on every request.
7. Deploy and verify submission, approval, private-list protection, public
   display, and persistent storage on the actual domain. Establish a database
   backup/recovery procedure before relying on it for customer history.

The feature currently has no verified-customer process, customer editing,
photo uploads, automated moderation, email notifications, or complete
moderator audit log. These can be separate additions when a project needs them.

## References

- Existing project walkthrough: `LOCAL-DEVELOPMENT.md`.
- Cloudflare D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
- Cloudflare Turnstile setup: https://developers.cloudflare.com/turnstile/get-started/
- Cloudflare Access: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/

This document describes the local implementation as it exists today. Update
it when production authentication, deployment, or moderation behavior changes.
