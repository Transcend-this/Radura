# DayGuard: rules for making updates

DayGuard is a live app that a person with a neurological condition uses every day. A careless change can erase his history, so follow these rules every time.

## What is where
- `index.html`: the whole app in one self-contained page, served as the live site. The engine (all rules and math) sits between `/*ENGINE START*/` and `/*ENGINE END*/`; the rest is the view.
- `verify/stats.js`: must stay byte-for-byte identical to the statistics code inside `index.html`.
- `tests/run_page_tests.js`: runs the page's built-in tests and the storage scenarios.
- `CHANGELOG.md`: one entry per release, newest first.

## Never change (it would wipe or orphan saved history)
- The storage key `dg-tracker-v1`, the day-record field names, or the backup format `{app:'DayGuard',version:1,...}`.
- If a new field is needed, add it as optional; old days without it must still load and display.
- The site address. History is tied to it.

## Every release
1. Make the change in `index.html`.
2. Bump `APP_VERSION` and `APP_UPDATED` (the two lines under the `VERSION:` comment). Use 1.1, 1.2 ... for features and fixes; 2.0 only for a big redesign.
3. Add a CHANGELOG.md entry: version, date, and plain-language bullet points of what changed for the user.
4. If you touched the math, add or update a built-in test, copy the math into `verify/stats.js`, and run `python3 verify/verify_stats.py`.
5. Run `cd tests && npm install && node run_page_tests.js`. It must end with ALL PASSED. Do not push if it fails.
6. Commit with a message like `DayGuard 1.1: <summary>` and push to `main`. The site updates within a couple of minutes.

## To undo a bad release
Revert the commit (`git revert <commit>`) and push. Saved history is untouched because it lives in the user's browser.
