# Code Review Report

Generated: 2026-05-21

## Summary

This is a full-stack radiation safety compliance dashboard (Landauer RSO Dashboard) consisting of a React/TypeScript Vite frontend with aws-amplify v6 Cognito authentication, a Python 3.11 AWS Lambda backend, DynamoDB, and an API Gateway HTTP API deployed via AWS SAM. A total of **28 issues** were found across the codebase. The most critical concerns are an unauthenticated public API endpoint, hardcoded CORS origins that are out of sync between the Lambda and the SAM template, raw exception messages exposed in API error responses, and a mislabelled "Logout" button that only closes a panel. There are also medium and low issues around hardcoded values, missing `ImportMetaEnv` declarations, duplicate calendar code, dead UI buttons with no handlers, and minor React/TypeScript patterns.

---

## Issues Found

### [File: lambda/review_rules/app.py]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 1 | **Raw exception message exposed in 500 response** — Line 63: `json.dumps({"error": str(exc)})`. Python `boto3` `ClientError` strings can leak table names, ARNs, AWS account IDs, and region information to the caller. | High | Return `{"error": "Internal server error"}` to the client. Log the full exception server-side using `print(exc)` (captured by CloudWatch) or `aws_lambda_powertools` logger. |
| 2 | **ALLOWED_ORIGINS does not match template.yaml CorsConfiguration** — Lines 12–15: `ALLOWED_ORIGINS` allows only `http://localhost:5174` and `https://localhost:5174`. The SAM template (lines 100–102) additionally allows `http://localhost:5173` and `http://localhost:5175`. Any browser request from ports 5173 or 5175 will receive an empty `Access-Control-Allow-Origin` header from the Lambda, causing a CORS failure even though API Gateway accepts the origin. | High | Expand `ALLOWED_ORIGINS` in `app.py` to exactly match `template.yaml`, or remove the manual CORS logic from Lambda entirely and rely solely on the API Gateway `CorsConfiguration`, which already injects the header for allowed origins automatically. |
| 3 | **No production CORS origin configured** — Both `app.py` and `template.yaml` only list `localhost` origins. Any production deployment will have all browser requests CORS-blocked. | High | Move the allowed origins to an environment variable (e.g., `ALLOWED_ORIGINS` comma-separated). Pass it from a SAM parameter in `template.yaml` so a production URL can be injected at deploy time without modifying source code. |
| 4 | **Unused import** — Line 4: `from boto3.dynamodb.conditions import Attr` is imported but never referenced in the file. | Low | Remove the import. |

---

### [File: template.yaml]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 5 | **API endpoint is publicly unauthenticated** — The `ComplianceApi` `HttpApi` has no Cognito JWT authorizer configured. The `GetReviewRules` event (lines 123–129) has no `Auth` property. Any client on the internet that discovers the endpoint URL can retrieve all compliance rules without authenticating. | Critical | Add a JWT authorizer to the `HttpApi` definition referencing `LandauerUserPool`. Example: `Auth: DefaultAuthorizer: CognitoAuthorizer` with `Authorizers: CognitoAuthorizer: IdentitySource: $request.header.Authorization JwtConfiguration: issuer: !Sub "https://cognito-idp.${AWS::Region}.amazonaws.com/${LandauerUserPool}" audience: [!Ref LandauerWebClient]`. On the frontend, pass the Cognito ID token as `Authorization: Bearer <token>` in the `fetch` call in `ActionCenterPanel.tsx`. |
| 6 | **OAuth implicit flow is deprecated** — Line 62: `AllowedOAuthFlows: - implicit`. The implicit flow is deprecated by RFC 9700 and the OAuth 2.0 Security BCP. Tokens returned in URL fragments are vulnerable to leakage via browser history and referrer headers. | High | Switch to `code` (authorization code with PKCE), which is the current best practice for SPAs. Amplify v6 supports PKCE natively. Remove `implicit` from `AllowedOAuthFlows`. |
| 7 | **CallbackURLs and LogoutURLs only list a single localhost port** — Lines 57–60 list only `http://localhost:5174`. The Vite dev server can bind to 5173 or 5175, and no production URL is present. If a production origin is never added, Cognito will reject OAuth redirects for real users. | High | Add all three localhost ports and a production URL as a SAM parameter so they can be supplied at deploy time. |
| 8 | **Hardcoded physical resource names block multi-environment deploys** — Lines 22, 49, 82: `UserPoolName: landauer-userpool-sam`, `ClientName: landauer-webclient-sam`, `TableName: compliance-rules-sam`, and line 117 `FunctionName: landauer-compliance-sam` are static strings. Deploying a second stack (e.g., staging) in the same account and region will fail with DynamoDB naming conflicts and silently share Cognito resources. | Medium | Use `!Sub "compliance-rules-${AWS::StackName}"` patterns for all physical names, or remove the explicit name properties entirely to allow CloudFormation to generate unique names. |
| 9 | **Password policy does not require symbols** — Line 32: `RequireSymbols: false`. For a healthcare-adjacent application that manages regulated radiation safety compliance data, this weakens the authentication posture. | Medium | Set `RequireSymbols: true` to align with NIST SP 800-63B guidance for sensitive regulatory applications. |
| 10 | **DynamoDB table has no deletion protection or point-in-time recovery** — The table definition (lines 78–91) includes neither `DeletionProtectionEnabled` nor `PointInTimeRecoverySpecification`. Accidental stack deletion or a runaway script could destroy compliance data irreversibly. | Medium | Add `DeletionProtectionEnabled: true` and `PointInTimeRecoverySpecification: PointInTimeRecoveryEnabled: true` to the `ComplianceRulesTable` resource. |
| 11 | **No CloudWatch log group with a retention policy for the Lambda** — Without an explicit log group resource, Lambda creates one with infinite retention. For a compliance application this creates unbounded storage cost and may violate data-retention policies. | Low | Add an `AWS::Logs::LogGroup` resource with `LogGroupName: !Sub "/aws/lambda/${ReviewRulesFunction}"` and an appropriate `RetentionInDays` (e.g., 90). |
| 12 | **Lambda timeout of 30 seconds is unnecessarily high** — Line 6: `Timeout: 30`. For a read-only DynamoDB scan of a small table, 30 seconds is excessive. It also means API Gateway waits up to 30 seconds before returning an error to the browser on a hung invocation. | Low | Reduce to `10` seconds. This is still ample for a paginated scan of a small compliance-rules table. |

---

### [File: scripts/seed_dynamodb.py]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 13 | **Wrong table name** — Line 119: `dynamodb.Table("compliance_rules")` uses underscores. The actual deployed table is `compliance-rules-sam` (hyphens, `-sam` suffix). Running this script against the real stack targets a non-existent table, causing a silent no-op or an unexpected `ResourceNotFoundException`. | High | Change to `dynamodb.Table("compliance-rules-sam")`, or accept the table name as a CLI argument (`--table-name`) to make the script portable across environments. |
| 14 | **Default region is `us-east-1` but the stack deploys to `ap-south-1`** — Line 130: `default="us-east-1"`. Running the script without `--region` seeds the wrong AWS region. | Medium | Change the default to `"ap-south-1"` to match the `samconfig.toml` deployment region, or document clearly in the script's docstring that `--region ap-south-1` is mandatory. |
| 15 | **No error handling on the batch write** — The `seed()` function has no `try/except`. A `ClientError` (table not found, permission denied) produces an unformatted Python traceback with no actionable guidance. | Low | Wrap the `with table.batch_writer()` block in `try/except botocore.exceptions.ClientError as e:` and print a clear message with `e.response['Error']['Message']` before exiting non-zero. |

---

### [File: src/vite-env.d.ts]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 16 | **Three Cognito env vars are missing from `ImportMetaEnv`** — `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, and `VITE_COGNITO_REGION` are consumed in `AuthContext.tsx` (lines 18–20) but are not declared in the `ImportMetaEnv` interface (lines 3–6 of `vite-env.d.ts`). TypeScript therefore widens their type to `any`, defeating strict-mode type safety and removing compile-time detection of missing variables. | Medium | Add `readonly VITE_COGNITO_USER_POOL_ID: string;`, `readonly VITE_COGNITO_CLIENT_ID: string;`, and `readonly VITE_COGNITO_REGION: string;` to the `ImportMetaEnv` interface. |
| 17 | **`VITE_COMPLIANCE_API_URL` is declared but never used** — Line 4 declares `VITE_COMPLIANCE_API_URL`, but no file in the project references it (`VITE_COMPLIANCE_DYNAMODB_URL` is used instead in `ActionCenterPanel.tsx` line 70). The dead declaration creates confusion about which variable drives the API call. | Low | Remove `readonly VITE_COMPLIANCE_API_URL: string` from the interface. |

---

### [File: src/auth/AuthContext.tsx]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 18 | **`signOut` is typed `() => void` but implemented as `async`** — Line 33 in the interface vs. line 64 in the implementation. Callers (e.g., `Header.tsx` line 49 via `onLogout={signOut}`) invoke it without `await`, so any rejection from `amplifySignOut()` is silently swallowed with no error surfaced to the user. | Medium | Change the interface type to `signOut: () => Promise<void>`. Add a `try/catch` inside `signOut` to log or display errors so a network failure during sign-out does not leave the app in an authenticated-but-broken state. |
| 19 | **`Amplify.configure()` called at module level without env var guards** — Lines 15–22 configure Amplify at import time. If `.env` is missing or incomplete, `userPoolId` and `userPoolClientId` will be `undefined`, causing cryptic internal Amplify SDK errors at sign-in rather than a clear startup message. | Medium | Add a guard before calling `Amplify.configure`: check that both env vars are non-empty strings and throw a descriptive `Error` (or `console.error`) during development if they are absent. |
| 20 | **`getCurrentUser()` called a second time after successful sign-in** — Lines 50 and 60: `amplifySignIn` is called, then `getCurrentUser()` is called again to retrieve the username. `amplifySignIn` already confirmed sign-in is complete; the second call is an unnecessary extra network round-trip on every login. | Low | Extract the username from the `amplifySignIn` result directly, or cache it from the first `getCurrentUser()` call. |

---

### [File: src/components/ActionCenterPanel.tsx]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 21 | **"Logout" button calls `onClose`, not `signOut`** — Line 122: the button is labelled "Logout" but its `onClick` is `onClose`, which only closes the panel overlay. Clicking it does not sign the user out, creating a serious UX and potential security misunderstanding. | High | Either rename the button to "Close" to match its actual behaviour, or wire it to `useAuth().signOut()` (import `useAuth` in this component). |
| 22 | **`fetch` to the compliance API sends no Authorization header** — Line 70: `fetch(import.meta.env.VITE_COMPLIANCE_DYNAMODB_URL)` has no credentials. Once the API Gateway endpoint has a Cognito authorizer (issue #5), all requests without a valid JWT will receive a 401 and the compliance data will never load. | High | Retrieve the current session via `fetchAuthSession()` from `aws-amplify/auth` and include the token: `headers: { Authorization: \`Bearer \${session.tokens?.idToken?.toString()}\` }`. |
| 23 | **`CATEGORY_PILLS` pill counts are hardcoded and the active pill never filters tasks** — Lines 13–23: counts like `count: 97` and `count: 4` are static. `activePill` state is set on click but is never used to filter `filteredTasks` (line 62 only checks `searchQuery`). | High | Derive pill counts from the actual task list and apply `activePill` as an additional filter on `filteredTasks`, matching the pattern used by `SeveritySummaryBar`. |
| 24 | **`selectedAssignee` and `selectedStatus` state values are never used to filter tasks** — `filteredTasks` (line 62) ignores both. The dropdowns accept input but produce no visible effect. | Medium | Apply both filters to `filteredTasks` alongside `searchQuery`, or add a comment clearly marking them as placeholder UI until the feature is implemented. |
| 25 | **Dead UI — "Due Date", "Priorities", and "Categories" filter buttons have no `onClick` handlers** — Lines 224–234 render interactive buttons that do nothing when clicked. | Medium | Implement the filter handlers, or apply `disabled` styling and a `disabled` attribute until the feature is ready. |
| 26 | **Dead UI — "Add Task" button has no `onClick` handler** — Line 315 renders a clickable button that does nothing. | Medium | Implement the add-task flow or remove the button until it is ready. |
| 27 | **Compliance alert banner hardcodes "2 compliance rules"** — Line 152: `"2 compliance rules need your attention"` is a static string that does not reflect the actual data. Before the first fetch, there is no data to count; after the fetch, this number is stale. | Medium | Replace with a dynamic count once data is loaded, or omit the count and say "compliance rules need your attention" until the count is known. |
| 28 | **Duplicate calendar widget** — Lines 356–431 re-implement a full mini calendar inline, duplicating the logic already in `CalendarSidebar.tsx`, `CalendarDayCell.tsx`, and `CalendarHeader.tsx`. Any bug fix or style change must be applied in two places. | Medium | Extract the shared calendar into a `<MiniCalendar>` component and use it in both `CalendarSidebar` and `ActionCenterPanel`. |
| 29 | **`formatDueDate` duplicates date parsing from `calendarUtils.ts`** — Lines 38–41 define a local `formatDueDate` that splits an ISO date string, which `calendarUtils.ts` already handles via `parseISODate` and `formatDisplayDate`. | Low | Remove `formatDueDate` and call `formatDisplayDate` from `calendarUtils.ts`, or add a second exported format function to `calendarUtils.ts` for the `M/D/YYYY` format needed here. |
| 30 | **Settings gear icon button in the Action Center header has no `aria-label` and no `onClick`** — Lines 109–114: the button is visually present and interactive but does nothing and has no accessible name. | Low | Add `aria-label="Settings"` and either wire an `onClick` or set `disabled` until the feature is implemented. |

---

### [File: src/pages/ComplianceEnginePage.tsx]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 31 | **Dead UI — settings gear icon and "Action Center" button have no `onClick` handlers** — Lines 66–71 (gear) and line 72 ("Action Center") render as interactive but do nothing. The "Action Center" label is especially confusing because the user arrived here from the Action Center. | Medium | Wire the "Action Center" button to call `onBack()`, add `aria-label="Settings"` to the gear button, and either implement or disable both. |
| 32 | **Severity/category casts bypass type narrowing** — Lines 30–31: `(r.status === 'NON_COMPLIANT' ? 'Critical' : 'High') as Severity` and `'Regulation' as TaskCategory`. The `as` casts silence the compiler. If a new `ComplianceStatus` variant is added, there is no compile-time warning that the mapping is incomplete. | Low | Use a typed lookup object: `const statusToSeverity: Record<Exclude<ComplianceStatus, 'COMPLIANT'>, Severity> = { NON_COMPLIANT: 'Critical', NEEDS_REVIEW: 'High' }` and index into it. The compiler will then flag any unmapped variant. |

---

### [File: src/pages/DashboardPage.tsx]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 33 | **`allTasks` spread and `criticalTasks` filter create new array references on every render** — Line 17: `const allTasks = [...MOCK_TASKS, ...extraTasks]` and line 56: `allTasks.filter(t => t.severity === 'Critical')` both run unconditionally on every render. This causes all child components receiving these arrays (`TaskListPanel`, `CalendarSidebar`, `ActionCenterPanel`) to re-render even when `extraTasks` has not changed. | Low | Memoize both: `const allTasks = useMemo(() => [...MOCK_TASKS, ...extraTasks], [extraTasks])` and `const criticalTasks = useMemo(() => allTasks.filter(t => t.severity === 'Critical'), [allTasks])`. |

---

### [File: src/data/mockTasks.ts]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 34 | **Task `status` values are hardcoded relative to specific dates** — Tasks like `task-008` are marked `'Due Today'` with `dueDate: '2026-05-15'`. As time passes the statuses become factually incorrect without any code change (e.g., `'Due Today'` tasks will show as `'Due Today'` even weeks later). | Medium | Derive `status` dynamically from `dueDate` and the current date (e.g., `dueDate < today ? 'Overdue' : dueDate === today ? 'Due Today' : 'Upcoming'`). Apply this derivation inside a utility function called at consumption time rather than baking it into the static data. |
| 35 | **Mock data ships unconditionally in the production bundle** — `MOCK_TASKS` is always imported and rendered in `DashboardPage.tsx`. There is no feature flag separating dev-only demo data from production data. | Medium | Gate behind `VITE_USE_MOCK_DATA=true` in `.env.development` so the mock array tree-shakes out of production builds. |

---

### [File: src/utils/calendarUtils.ts]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 36 | **`buildCalendarDays` calls `getTasksForDate` 42 times per render** — Each of the 42 iterations performs a linear scan (`tasks.filter`) over the entire task array, giving O(n × 42) work inside a render path. With 15 mock tasks this is negligible but will degrade visibly with large real datasets. | Low | Pre-group tasks into a `Map<string, Task[]>` keyed by ISO date string before the loop, then do O(1) lookups per cell. |

---

### [File: src/main.tsx]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 37 | **Unsafe non-null assertion on DOM root** — Line 6: `document.getElementById('root')!`. If `index.html` ever lacks `<div id="root">`, React throws a cryptic `Cannot read properties of null` error instead of a clear message pointing to the misconfiguration. | Low | Add a null guard: `const rootEl = document.getElementById('root'); if (!rootEl) throw new Error('Root #root element not found in index.html'); ReactDOM.createRoot(rootEl).render(...)`. |

---

### [File: package.json]

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| 38 | **`amazon-cognito-identity-js` is listed as a direct dependency** — Line 12. This package is the lower-level SDK. With aws-amplify v6 as a dependency, `amazon-cognito-identity-js` is already a transitive dependency of Amplify. Having it as a direct dependency can lead to version conflicts if the two packages resolve to different internal copies. | Low | Remove `amazon-cognito-identity-js` from `dependencies` in `package.json` and rely on the version pulled in transitively by `aws-amplify`. |

---

## Issues by Severity

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 8 |
| Medium | 14 |
| Low | 15 |
| **Total** | **38** |
