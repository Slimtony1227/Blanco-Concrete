# Run the website with local reviews

The active website is now at `/Volumes/SANDISKO/DavidNC`. The older files under
`dev/blanco-site` are preserved, but are not used by this startup command.

## Start everything

```bash
cd /Volumes/SANDISKO/DavidNC
npm start
```

- `cd` changes the terminal's working directory.
- `npm start` runs the `start` shortcut in package.json.
- That shortcut runs `node scripts/start-local.mjs`: Node executes that file.
- `npm run dev:local` is an alternate name for the same startup process.

The script builds React into `dist`, applies missing database setup files, then
starts the website and Worker at http://127.0.0.1:8787. On the first run Wrangler
may ask to apply the database change: answer `y` (yes). Subsequent starts skip
already-applied changes. They do not erase your reviews.

Keep the terminal running. Press Control+C to stop. After changing React files,
stop and rerun `npm start` to rebuild them. `npm run dev` still starts Vite alone
for interface work; it does not run the reviews database or API.

## Test a review

1. Open the home page and scroll below the green quote button.
2. Select Leave a review (Deja tu reseña in Spanish), fill in the form, and submit.
3. The submission stays pending and will not appear publicly.
4. Open http://127.0.0.1:8787/admin/reviews.
5. Open `.dev.vars` in your editor and copy only the value after
   `LOCAL_ADMIN_TOKEN=` into the local access key field. Do not share this file.
6. Publish or reject the review. Published and rejected lists preserve history.
   Return to pending unpublishes a previously published review.
7. Reload the home page to see published reviews. Older reviews use View more.

The startup script generates the key once if it is missing. It stays in this
computer's ignored .dev.vars file. The management page holds it in memory only;
refreshing that page signs you out. The key is not included in the website build.

The interface switches between Spanish and English. Customers' original words
stay in the submitted language. No sample testimonials are added automatically.

## What starts the database?

The file `migrations/0001_reviews.sql` creates the reviews table. A migration is
a numbered set of database changes. Wrangler records which migrations it has
applied, so restarting does not recreate the table or delete data.

These are the Wrangler commands the startup script runs after building:

```bash
wrangler d1 migrations apply blanco-reviews-local --config wrangler.local.jsonc --local
wrangler dev --config wrangler.local.jsonc --local --ip 127.0.0.1 --port 8787
```

- `d1` selects database commands.
- `migrations apply` applies only database changes not already recorded.
- `blanco-reviews-local` identifies the database in our configuration.
- `dev` starts the local Worker and website server.
- `--config` selects our specifically named local configuration file.
- `--local` runs against local resources instead of a hosted database.
- `--ip 127.0.0.1` binds the server to this computer only.
- `--port 8787` selects the numbered local connection point used by the URLs above.

For a database check after initial startup:

```bash
npm run db:check
```

`npm run` runs a named shortcut. `db:check` runs `wrangler d1 execute` with the
same `--config` and `--local` options and `--command "SELECT count(*) AS reviews
FROM reviews"`. `execute` runs database instructions; `--command` supplies those
instructions. The quoted SQL counts all submissions, including pending and
rejected ones. It does not publish or modify them.

## Configuration, data, and files

`wrangler.local.jsonc` uses JSON with comments (`//` starts a comment):

| Setting | Purpose |
| --- | --- |
| `$schema` | Lets the editor validate configuration settings. |
| `name` | Names the local Worker. |
| `main` | Selects worker/index.js as the request-handling file. |
| `compatibility_date` | Fixes the runtime behavior to a particular date. |
| `workers_dev: false` | Disables a workers.dev address if deployed; this alone is not a deployment lock. |
| `LOCAL_REVIEW_MODE` | Explicitly enables the local prototype API. |
| `assets.directory` | Points to Vite's built files in dist. |
| `assets.binding` | Lets Worker code access those files through env.ASSETS. |
| `not_found_handling` | Lets React handle page addresses like /nosotros. |
| `run_worker_first` | Sends /api and /api/* to the Worker before serving website files; * matches the remaining path. |
| `d1_databases` | Lists database connections; a binding is a named connection. |
| `binding: DB` | Gives Worker code database access through env.DB. |
| `database_name` | Identifies the database in terminal commands. |
| `database_id` | A local placeholder, not a hosted database ID. |
| `migrations_dir` | Locates the numbered database setup files. |
| `remote: false` | Keeps this database connection local during development. |

Local data is saved in the root `.wrangler/state` folder between runs. Do not
delete it if you want to keep your test reviews. It and .dev.vars are ignored
by Git. The old nested database is separate and has not been moved or deleted.

The reviews table stores an ID, submission ID (to prevent duplicates on retry),
display name, rating, comment, status, submission time, and moderation time.
The server validates input and always starts new submissions as pending.
Review text is rendered as text, not HTML. Only authenticated local management
requests can read pending/rejected reviews or change their status.

## Test tools

`npm run test:reviews` uses Node's built-in test runner (`--test` selects test
mode) against the running local server. It creates temporary submissions and
removes only its own test rows afterwards. Do not run it against hosted data.

`npm run build` makes the production website files; `npm run lint` checks code
for likely mistakes. These do not deploy the website.

## Hosted Cloudflare setup

The production website was deployed on October 26, 2026, as version
`050c56fd-8888-4438-82ca-6f65c86917db` using `wrangler.production.jsonc`.
It connects to the migrated online D1 database, uses the encrypted Turnstile
secret and matching widget, limits submissions, and protects administration
with Cloudflare Access. Only the owner is authorized to manage reviews.

A live test confirmed submission stays pending, approval publishes it, and
rejection removes it from public display. The labeled deployment test is retained
only in the private rejected list. Public results are empty. An unauthenticated
request cannot access administration; an invalid challenge cannot save a review.
The sitemap and robots file are live. See `reviewSection.md` for full status.

`npm start` still uses only `wrangler.local.jsonc` and the isolated local database.
Local mode requires LOCAL_REVIEW_MODE=true and a local hostname. Production
requires LOCAL_REVIEW_MODE=false, valid Access settings, HTTPS, and the allowed
hostname. A local key cannot authorize production requests. Do not deploy the
local configuration. The local form accepts test submissions without challenges.

For a future production release, build with `npm run build`, then deploy with
`npx wrangler deploy --config wrangler.production.jsonc`. This publishes online;
it is separate from committing and pushing source to GitHub. The production
config requires the existing encrypted secret and never contains its value.
Prepared source is still uncommitted and has not been pushed to GitHub `main`.

Wrangler 4.147.0 is the development tool already agreed on. Installation used
`npm install --save-dev --save-exact wrangler@4.147.0`: `--save-dev` records a
development tool, `--save-exact` pins its precise version, and `@4.147.0` selects
that version. For a fresh checkout, `npm ci` installs the lockfile's exact packages
and replaces node_modules.

With user approval, `jose` 6.2.13 was added for Access signature and claim
verification. `npm install --save-exact jose` installs the library and pins
its resolved version. No frontend login or database library was added.
`npm run test:access` runs `node --test scripts/access.test.mjs`; `--test` enables
Node's test runner. These authentication tests use temporary signing keys and
simulated database/asset responses, with no live account, login token, or DB access.
`npm run test:reviews` still exercises the running local server and local D1.

On October 24, 2026, npm audit reported six high-severity affected packages in
the existing Vite/Wrangler toolchain and related dependencies, with none listed
for jose. Dependency upgrades were not included in this authentication change.

Reference: https://developers.cloudflare.com/d1/reference/migrations/

The hosted admin screen loads reviews using the browser session and offers
**Sign in again** when Access denies a request. **Sign out** uses Cloudflare's
logout endpoint, which signs out across the organization's Access applications.
No Access token is stored or read by the frontend. Local sign-out clears only
the in-memory key. See `reviewSection.md` for the workflow and request options.

`npm run test:admin` checks the browser request helper without a running server.
It uses `node --test`; `--test` selects Node's built-in test runner. It covers
cookies, local key isolation, denied sessions, redirects, and network errors.

Production spam protection now loads the official Turnstile widget, verifies
its token in the Worker, and applies an approximate limit of five submission
attempts per minute per IP per Cloudflare location. Local submissions still skip
Turnstile. `npm run test:spam` checks the production protections using simulated
responses. The live public site key has been configured and the encrypted secret
must be stored in Cloudflare. See `reviewSection.md` for setup commands and flags.
