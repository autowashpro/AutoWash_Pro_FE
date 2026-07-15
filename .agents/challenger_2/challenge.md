## Challenge Summary

**Overall risk assessment**: LOW

## Challenges

### [Low] Challenge 1: Absence of loading skeletons/fallbacks for dynamic imports
- **Assumption challenged**: Assumed that dynamically importing high-fidelity components like `HeroCinematicStoryboard` and `RevenueChart` with `ssr: false` is sufficient for a good user experience.
- **Attack scenario**: On slower mobile or throttled connections, the lack of loading fallbacks (currently `dynamic(..., { ssr: false })` has no loading template) leads to abrupt layout shifts (Cumulative Layout Shift) and prolonged blank space before hydration completes.
- **Blast radius**: User experience degradation, layout jumps on initial load of the landing page (`/`) and dashboard pages.
- **Mitigation**: Add a lightweight loader skeleton to the dynamic configuration: `loading: () => <LoadingSkeleton />`.

### [Medium] Challenge 2: E2E testing environment dependency blocker
- **Assumption challenged**: Assumed the E2E test suite can run out-of-the-box in all test environments.
- **Attack scenario**: Executing `npm run test:e2e` fails completely because the Playwright browser binaries (e.g. Chrome Headless Shell) are missing or not downloaded.
- **Blast radius**: The complete test suite is blocked in CI/CD or local verification unless `npx playwright install` is executed first.
- **Mitigation**: Document browser setup instructions or include browser installation in the setup scripts.

## Stress Test Results

- **Unit Test verification** → Expect utility formatting and API export checks to pass → Smoke and utility unit tests passed successfully → **PASS**
- **Production Build verification** → Expect dynamic components to be split into standalone chunks and excluded from the initial payload → Verified that dynamic chunks for `HeroCinematicStoryboard`, `RevenueChart`, and manager reporting charts are not in the preloaded scripts for `/`, `/admin`, and `/manager/bao-cao` → **PASS**
- **Runtime Execution verification** → Expect dev server to serve pages cleanly → HTTP request to `http://localhost:3000/` succeeded with a status code of 200 and served valid HTML markup → **PASS**
- **E2E Test execution** → Expect Playwright specs to execute and verify critical user flows → Failed due to missing Chromium browser binaries → **FAIL (Blocker: Environment setup)**

## Unchallenged Areas

- **Backend API Integration** — Backend was not started or tested as the task scope is strictly limited to frontend build and client-side performance verification.
