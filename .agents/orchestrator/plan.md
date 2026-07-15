# Next.js 16 Performance Optimization Plan

## Objectives
1. Actively configure Next.js 16 with Turbopack for local development to optimize dev and build cycles (R1).
2. Tweak next.config.mjs to support package imports optimization (R1).
3. Lazily load WebGL (3D) and Recharts components using `next/dynamic` with `ssr: false` to reduce initial Javascript bundle size and improve hydration speed (R2).
4. Run validation, verify builds compile cleanly, check tests, run Playwright E2E tests, and execute Forensic Auditor check.

## Decomposed Steps / Milestones

### Phase 1: Exploration & planning
- [ ] Task 1.1: Spawn `teamwork_preview_explorer` to inspect package.json, next.config.mjs, and component import graphs.
- [ ] Task 1.2: Check if any other files or components are heavy and should be optimized.
- [ ] Task 1.3: Detail exact dynamic importing pattern to be used.

### Phase 2: Implementation of R1 & R2
- [ ] Task 2.1: Spawn `teamwork_preview_worker` to edit package.json and next.config.mjs.
- [ ] Task 2.2: Spawn `teamwork_preview_worker` to lazy import 3D components in landing page and storyboards.
- [ ] Task 2.3: Spawn `teamwork_preview_worker` to dynamic-import recharts in dashboard page and revenue chart wrapper.
- [ ] Task 2.4: Ensure no typescript errors, eslint failures, or code breakages occur.

### Phase 3: Verification & Review
- [ ] Task 3.1: Spawn `teamwork_preview_reviewer` to check correctness, typescript safety, and alignment with Next.js 16 conventions.
- [ ] Task 3.2: Spawn `teamwork_preview_challenger` to run build verify, start local dev, verify dev server startup under 5s, verify page loads, and test E2E flows via Playwright.
- [ ] Task 3.3: Spawn `teamwork_preview_auditor` to verify integrity and correctness.

### Phase 4: Sign-off
- [ ] Task 4.1: Synthesize results, update status in progress.md and PROJECT.md, and write handoff.md.
