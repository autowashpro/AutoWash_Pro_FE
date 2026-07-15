# Handoff Report — M3 Performance Optimization Fixes

## 1. Observation
*   **File Path & Lines**: `package.json`
    *   Previously missing `typescript-eslint` and `@next/eslint-plugin-next` in `devDependencies`.
    *   Previously had `"eslint": "^10.4.1"` as devDependency.
*   **Command Result**: Run `npm run lint` with `eslint@10.4.1` and `typescript-eslint@8.24.0`:
    ```
    TypeError: Class extends value undefined is not a constructor or null
        at Object.<anonymous> (D:\SEMESTER-IN-FPT\SUMMER26\SWP\AutoWash_Pro_FE\node_modules\@typescript-eslint\utils\dist\ts-eslint\eslint\FlatESLint.js:12:49)
    ```
*   **Command Result**: Run `npm run build` after adding plugins:
    ```
    Module not found: Can't resolve 'react-is'
      1 | import get from 'es-toolkit/compat/get';
      2 | import { Children } from 'react';
    > 3 | import { isFragment } from 'react-is';
    ```
*   **File Path & Lines**: `components/manager/bookings-bar-chart.tsx`
    *   Before edit, did not have default data prop value or empty data guard check. The `<Bar>` element was missing a Vietnamese tooltip `name` attribute.
*   **File Path & Lines**: `components/manager/services-pie-chart.tsx`
    *   Before edit, did not have default data prop value or empty data guard check.
*   **File Path & Lines**: `components/manager/revenue-trend-chart.tsx`
    *   Before edit, did not have default data prop value or empty data guard check.

## 2. Logic Chain
1. **Adding Linter Dependencies**: Based on user request, `typescript-eslint` and `@next/eslint-plugin-next` were added to package.json.
2. **Handling ESLint v10 Conflict**:
    *   Observation: `npm run lint` threw `TypeError` in `FlatESLint.js` because of class inheritance of `undefined` (FlatESLint does not exist under `eslint/use-at-your-own-risk` in ESLint v10).
    *   Reasoning: `typescript-eslint@8.24.0` peer dependencies specify compatibility with `^8.57.0 || ^9.0.0`.
    *   Conclusion: Downgraded `eslint` to `9.19.0` which is compatible with `typescript-eslint@8.24.0` and successfully resolved the crash.
3. **Handling Recharts Build Failure**:
    *   Observation: Compilation failed because `react-is` was not resolved.
    *   Reasoning: `recharts@3.8.0` relies on `react-is` for fragment checks.
    *   Conclusion: Installed `react-is` as a dependency.
4. **Implementing Fallback UI & Safe Props**:
    *   Reasoning: When `data` is empty or undefined, the chart components should not crash and should render a user-friendly Vietnamese fallback warning centered in a card styling that preserves page layout.
    *   Conclusion: Changed props to `data = []`, added conditional `if (!data || data.length === 0)` checks, and returned styled fallback UI divs for all three chart components. Also, added `name="Số lượng đặt"` on `<Bar>` in `bookings-bar-chart.tsx` to display Vietnamese tooltips.

## 3. Caveats
No caveats. The downgrade of `eslint` to v9 is fully tested and standard for `typescript-eslint` compatibility, and `react-is` is a standard helper package.

## 4. Conclusion
All issues identified by reviewers have been successfully resolved. The project builds, runs lint checks, and passes all smoke tests successfully.

## 5. Verification Method
Verify that everything is correct by executing the following commands in the workspace root:
1.  Run `npm run lint` to confirm ESLint checks pass with no warnings or errors.
2.  Run `npm run build` to verify the Next.js production build completes without compilation errors.
3.  Run `npm test` to verify unit smoke tests pass.
4.  Inspect `package.json` to ensure devDependencies are correct.
5.  Inspect chart components to verify the fallback checks and default prop initializations.
