# DayGuard

A daily energy, sleep and symptom tracker for someone living with a neurological or autoimmune condition. The whole app is `index.html`. Everything is saved in the user's own browser; nothing is sent anywhere.

- **Use it:** open the site link, or download `index.html` and double-click it.
- **What changed:** see [CHANGELOG.md](CHANGELOG.md).
- **How every number is worked out:** the DayGuard Technical Manual.
- **Making changes:** see [CLAUDE.md](CLAUDE.md) (the rules Claude follows for each update).
- **Run the checks:** `cd tests && npm install && node run_page_tests.js`, then `python3 verify/verify_stats.py` (needs numpy and scipy).

Not a medical device and not medical advice.
