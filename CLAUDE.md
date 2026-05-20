# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landauer RSO Dashboard — a radiation safety compliance tool for Radiation Safety Officers. The app lets RSOs view tasks, a compliance calendar, and run a "Compliance Engine" that fetches rules from AWS and flags violations to create action items.

## Commands

### Frontend
```bash
npm run dev        # Start Vite dev server (auto-picks port: 5173, 5174, or 5175)
npm run build      # tsc type-check + Vite production build → dist/
npx tsc --noEmit   # Type-check only, no emit
```

### AWS SAM Backend
```bash
sam build                        # Build Lambda into .aws-sam/build/
sam deploy --no-confirm-changeset  # Deploy without interactive prompt (uses samconfig.toml)
sam validate                     # Validate template.yaml syntax
```

### DynamoDB Seeding
```bash
python scripts/seed_dynamodb.py --region ap-south-1
# For local DynamoDB: add --endpoint-url http://localhost:8000
```

### Cognito User Management (AWS CLI)
```bash
# Create user
aws cognito-idp admin-create-user --region ap-south-1 --user-pool-id <pool-id> --username <email> --user-attributes Name=email,Value=<email> Name=email_verified,Value=true --message-action SUPPRESS --temporary-password "Temp@1234"

# Set permanent password (skip forced reset)
aws cognito-idp admin-set-user-password --region ap-south-1 --user-pool-id <pool-id> --username <email> --password "<password>" --permanent
```

## Architecture

### Full-Stack Flow
```
Browser → Vite (localhost:517x)
       → Cognito (SRP auth via aws-amplify v6)   ← login
       → API Gateway (HTTP API) /prod/review-rules ← compliance data
       → Lambda (landauer-compliance-sam)
       → DynamoDB (compliance-rules-sam)
```

### Frontend (`src/`)

- **`App.tsx`** — root. Wraps everything in `AuthProvider`. Shows `LoginPage` or `DashboardPage` based on `useAuth().user`.
- **`auth/AuthContext.tsx`** — Amplify v6 Cognito auth. Configures `Amplify` once at module load using `.env` vars. Exposes `{ user, loading, signIn, signOut }` via context. Session is restored on reload via `getCurrentUser()`.
- **`pages/DashboardPage.tsx`** — main view. Composes `Header`, `TaskListPanel`, `CalendarSidebar`, and `ActionCenterPanel`. Owns the merged task list (`MOCK_TASKS + extraTasks`).
- **`components/ActionCenterPanel.tsx`** — fullscreen overlay. Contains the **"Review Rules"** button that calls `fetch(VITE_COMPLIANCE_DYNAMODB_URL)`, then passes the returned `ComplianceRule[]` to `ComplianceEnginePage`.
- **`pages/ComplianceEnginePage.tsx`** — renders compliance rule cards with COMPLIANT/NON_COMPLIANT/NEEDS_REVIEW status badges. "Create Action Items" converts non-compliant rules into `Task[]` and surfaces them on the dashboard.
- **`data/mockTasks.ts`** — 15 hardcoded RSO tasks (overdue, due today, upcoming). These are always present; compliance-generated tasks are appended via `extraTasks` state.
- **`types/index.ts`** — all shared TypeScript interfaces: `Task`, `ComplianceRule`, `Assignee`, `CalendarDay`, etc.

### Backend (`lambda/review_rules/app.py`)

Single Lambda function. DynamoDB client is initialised at cold-start (module level). Handler does a full `table.scan()` with pagination, maps `rule_id → id`, and returns a JSON array. CORS origins are validated manually in `_cors_headers()` — the allowed set must stay in sync with the API Gateway `CorsConfiguration` in `template.yaml`.

### Infrastructure (`template.yaml`)

All resources use the `-sam` suffix to avoid conflicts with pre-existing AWS resources in the same account:

| Resource | Physical name |
|---|---|
| DynamoDB | `compliance-rules-sam` |
| Lambda | `landauer-compliance-sam` |
| Cognito User Pool | `landauer-userpool-sam` |
| Cognito App Client | `landauer-webclient-sam` |

Stack name: `rso-assist-sam` · Region: `ap-south-1` · Runtime: `python3.11`

### Environment Variables

`.env` is git-ignored. Copy from `.env.example` and fill in values from `sam deploy` Outputs:

```
VITE_COGNITO_USER_POOL_ID=ap-south-1_...
VITE_COGNITO_CLIENT_ID=...
VITE_COGNITO_REGION=ap-south-1
VITE_COMPLIANCE_DYNAMODB_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com/prod/review-rules
```

### Key Constraints

- **CORS sync**: `lambda/review_rules/app.py` has a hardcoded `ALLOWED_ORIGINS` set. When adding new origins, update both `app.py` and `template.yaml → CorsConfiguration.AllowOrigins`, then `sam build && sam deploy`.
- **Amplify v6 API**: imports come from `aws-amplify/auth` (modular), not the old `Auth` class from `aws-amplify`. Do not mix v5 and v6 patterns.
- **`global: 'globalThis'`** in `vite.config.ts` is required for `aws-amplify` to work in the browser build.
- **Handler**: `app.lambda_handler` maps to `lambda/review_rules/app.py` → `def lambda_handler`. Do not rename to `lambda_function.py`.
- **DynamoDB key**: primary key is `rule_id` (String). The Lambda maps it to `id` in the API response to match the frontend `ComplianceRule` type.
