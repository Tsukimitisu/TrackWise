# TrackWise QA and Production-Readiness Audit

Audit date: 2026-07-02  
Environment: Windows, PHP 8.0.30, Node 24.11.0, isolated SQLite QA database  

## 1. Overall Verdict

**Unsafe for real users**

TrackWise compiles and several individual APIs work, but critical authorization failures allow cross-user access, forged approvals, and full-record exports. Core student attendance, DTR, dashboard, documentation log, and narrative-report pages also rely on browser `localStorage` rather than the authenticated database API. The configured MySQL database was unavailable, notifications are broken, and installed dependencies contain known high-severity vulnerabilities.

## 2. Test Summary

| Result | Count |
|---|---:|
| Total checks executed | 85 |
| Passed | 49 |
| Failed | 32 |
| Blocked | 4 |
| Not tested | 0 |

Blocked coverage:

- Configured MySQL migration/status check: connection refused on `127.0.0.1:3306`.
- Backend JavaScript lint: no `lint` script.
- Frontend lint: no `lint` script.
- Interactive browser, mobile viewport, camera-permission, and console testing: browser runtime unavailable. These checks were not marked passed.

Automated Laravel result: **5 passed, 2 failed**. Both failures concern verification-notification assertions.

## 3. Working Features

- Frontend TypeScript production build succeeds.
- All 95 application PHP files pass `php -l`.
- All migrations apply successfully to a clean, isolated SQLite database.
- Guest API access and tampered Sanctum tokens return `401`.
- Seeded roles can authenticate.
- Password hashes are hidden from login responses.
- Inactive accounts cannot sign in.
- Logout revokes the current token.
- Registration forces the Student role even when a client submits `Super Admin`.
- Password change rejects the old password and accepts the new password.
- Admin can create students, supervisors, and assignments.
- Student is blocked from admin-statistics endpoints and dedicated report-approval routes.
- Clock-out without a matching clock-in is rejected.
- A first clock-in can be recorded.
- Invalid upload types and missing documentation metadata are rejected.
- A real PNG upload returns `201` and is written to storage.
- Weekly-report API draft generation uses approved daily-report records.
- Local API response times were acceptable for the tiny QA dataset: approximately 215–237 ms average.

These passes do not offset the authorization and data-source failures below.

## 4. Broken Features

| Page/API | Expected | Actual | Severity | Recommended fix |
|---|---|---|---|---|
| `GET /api/users` | Student denied or strictly scoped | Student receives all users | Critical | Add policies and role/organization query scopes. |
| Assignments API | Student/supervisor sees owned or assigned records only | Both can retrieve unrelated assignments | Critical | Authorize every model action and scope `index`. |
| Attendance API | Student can mutate only own assignment | Student created approved attendance for another student and deleted it | Critical | Derive assignment from authenticated user; never accept approval state from students. |
| Daily/weekly reports | Student can create only own draft | Student created foreign and pre-approved reports | Critical | Enforce ownership and set server-side initial status to `draft`. |
| `POST /api/approvals/{type}/{id}` | Reviewer-only | Student successfully approved a report | Critical | Add reviewer middleware plus assignment/company/school policy. |
| Export APIs | Own or authorized scope only | Student exported another student’s complete record | Critical | Apply the same policies and scopes used by normal reads. |
| User management | Organization Admin cannot create Super Admin | Organization Admin created Super Admin | Critical | Restrict assignable roles by actor hierarchy. |
| Student attendance/DTR UI | Real API/database records | Uses `localStorage` | Critical | Remove local OJT storage and connect all pages to attendance APIs. |
| Student dashboard | Database totals | Required/rendered hours derive from `localStorage` | Critical | Use scoped assignments and approved attendance from API. |
| Narrative-report UI | Real approved reports, hours, images | Uses `localStorage` and inserts canned reflection text | Critical | Use weekly-report generation API and real related records only. |
| Documentation listing | Server files and metadata | Main page stores a second browser-local copy | High | Read/write one database-backed source of truth. |
| Private media | Authorized download | Uploaded image URL is publicly accessible without a token (`200`) | High | Use private disk and authorized download/signed URLs. |
| Notifications | Submit/approval creates visible notification | Zero notifications after successful submit and approval | High | Reconcile schema/model fields and test creation/read lifecycle. |
| Supervisor approval | Assigned students only | Supervisor approved an unassigned student’s report | Critical | Require assignment ownership in report policies. |
| Coordinator scope | Own organization/program | Coordinator received all ten QA users | Critical | Add organization/program constraints. |
| Analytics/settings | Admin/coordinator only | Student sees global analytics; supervisor reads settings | High | Apply role middleware and scoped aggregations to GET routes. |
| Email update | New address becomes unverified | Address remains verified | High | Clear `email_verified_at`, revoke tokens, and send verification. |
| Duplicate clock-in | Friendly `422` | SQLite path throws `500` unique-constraint error | High | Normalize date storage/query and catch unique conflicts. |
| Time validation | Reject time-out before time-in | Implementation uses absolute `diffInMinutes` | High | Compare ordered datetimes and reject non-positive/impossible spans. |
| Company CRUD | Duplicate names handled | Two identical company names accepted | Medium | Add normalized unique constraint/validation or explicit duplicate policy. |
| Approval history | Every review audited | Dedicated approve/reject methods do not create approval logs | High | Centralize review workflow in one audited service. |
| Report detail UI | Correct role buttons | Compares lowercase roles to title-cased role names | High | Use shared role helper/constants and API permissions. |
| Report exports | Accurate hours | Export references missing `hours_worked` column and outputs zero | High | Join approved attendance totals or add a valid maintained column. |
| Monthly/final reports | Supported per product scope | No end-to-end implementation | High | Define APIs, templates, approval, and PDF generation. |
| Email notifications | Real mail when configured | Application notification service only logs “would send” | Medium | Use Laravel Mail/Notification transports and surface configuration state. |
| Failed-login lockout | Temporary account lockout | Valid login succeeds after six failures | Medium | Add user/IP throttling and lockout/audit policy. |
| Dependency security | No critical/high advisories | Multiple high advisories in PHP and npm trees | High | Upgrade supported Laravel/Symfony/React Router/Vite/Axios versions. |

## 5. Role Test Result

### Student

**Fail / unsafe.** Authentication protections work, but students can list users, access global data, read foreign assignments, forge foreign approved attendance, create foreign/pre-approved reports, approve via the generic approval endpoint, and export other students’ records.

### Company Supervisor

**Fail / unsafe.** Supervisor UI navigation is limited, but backend ownership is not. A supervisor can view and approve an unassigned student’s report.

### School Coordinator

**Fail / unsafe.** Coordinator management actions work, but user/report/assignment queries are not restricted to the coordinator’s organization or program.

### Admin

**Partial.** CRUD APIs work, but duplicates, audit coverage, global query design, and insecure exports prevent production use.

### Super Admin

**Fail separation.** The role exists, but Organization Admin can create another Super Admin. There is no enforceable top-level role boundary.

## 6. Attendance / DTR Test Result

**Fail.**

- Backend clock-in and missing-clock-in checks exist.
- Duplicate clock-in produced `500` under the supported SQLite test configuration because the cast date did not match the lookup representation.
- A student can submit `approval_status: approved`.
- A student can target another student’s assignment.
- Time ordering is not safely validated.
- The student Attendance, Time In/Out, Printable DTR, and dashboard-hours flows use browser-local records, not the authenticated attendance database.
- DTR therefore does not qualify as a real end-to-end feature.

## 7. Task Log and Documentation Test Result

**Fail overall.**

- Daily-report API CRUD and submission exist.
- Required task length is validated.
- React renders report text as escaped text; no `dangerouslySetInnerHTML` was found.
- Ownership, reviewer scope, and server-controlled status are missing.
- PNG upload is real and stored; invalid type and missing metadata checks pass.
- Foreign-assignment upload succeeds.
- Uploaded media is public.
- Main documentation list keeps a browser-local duplicate rather than querying uploaded files.

## 8. Narrative Report Test Result

**Fail.**

- The weekly-report API can generate a draft from approved daily reports.
- The student-facing Narrative Reports page does not use that API. It reads local DTR entries and inserts generic canned learnings, challenges, and reflection text.
- Attendance hours, server documentation images, supervisor/company details, monthly reports, and final reports are not integrated end-to-end.

## 9. Company / Supervisor Management Test Result

**Fail.**

Admin creation of companies, users, supervisors, and assignments works. Duplicate companies are accepted, organizational boundaries are not enforced, supervisor access is not assignment-scoped, and Organization Admin can escalate to Super Admin.

## 10. Dashboard Test Result

**Fail.**

Staff dashboard requests live APIs, but those APIs return global unscoped data. Student hours, profile readiness, attendance checklist, and documentation counts rely primarily on browser-local state. Statistics therefore do not satisfy the “real database data” requirement.

## 11. Reports and Export Test Result

**Fail.**

- CSV endpoints return downloadable content.
- Exports are unscoped and leak other students’ data.
- Daily export refers to a nonexistent `hours_worked` field.
- Printable DTR/narrative pages are local-browser print views, not verified server reports.
- No complete monthly, final, DOCX, or database-backed PDF report workflow was found.

## 12. Notification Test Result

**Fail.**

After daily report submit and supervisor approval, the authenticated student had zero notifications. The first notification migration creates `is_read`; a later migration conditionally defines `data/read_at` only when the table does not exist. `NotificationLog` writes `data/read_at`, while `NotificationController` reads `Notification` and `is_read`. Exceptions are swallowed by `NotificationService`.

## 13. UI / UX Test Result

**Blocked for interactive verification; static review found failures.**

- Responsive shell and semantic layout classes are present.
- Browser automation was unavailable, so no viewport, focus, camera permission, screenshot, or console test was passed.
- Several legacy detail pages are compressed into one line and use low-contrast `bg-gray-200 text-white` action buttons.
- Role checks on detail pages use lowercase names that do not match actual title-cased roles, hiding review actions.
- Mojibake such as `Â©` and malformed bullet placeholders remains on registration UI.
- Several failures only log to `console.error` with no actionable user message.
- Main student pages are visually polished but mask the local/browser-only data architecture.

## 14. API Coverage Result

| Feature | Frontend action | Backend endpoint | Database table | Auth | Permission expected | Actual result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Login | Sign in | `POST /auth/login` | users, tokens | No | Active + verified | Works | Pass | No hash leaked |
| Logout | Sign out | `POST /auth/logout` | tokens | Yes | Current user | Token revoked | Pass | |
| Users | Users list | `GET /users` | users | Yes | Admin/coordinator scoped | Student gets all | Fail | RBAC |
| Companies | Company list/CRUD | `/organizations` | organizations | Yes | Role + org scope | Writes role-gated; reads global | Fail | Duplicates accepted |
| Assignments | Assigned students | `/assignments` | user_programs | Yes | Owner/assigned reviewer | Global | Fail | IDOR |
| Attendance | Clock in/out | `/attendance-logs*` | attendance_logs | Yes | Own assignment | Foreign approved write | Fail | Critical |
| Daily logs | Create/submit/review | `/daily-reports*` | daily_reports | Yes | Own/reviewer scope | Foreign/status spoof | Fail | Critical |
| Weekly narrative | Generate draft | `/weekly-reports/generate-draft` | weekly_reports, daily_reports | Yes | Own assignment | Foreign generation allowed | Fail | Own-data generation works |
| Documentation | Capture/upload | `/documentation-files` | documentation_files | Yes | Own assignment/private file | Foreign upload/public URL | Fail | Real storage works |
| DTR | Print | No dedicated real API | localStorage | UI token | Own approved attendance | Browser-local | Fail | |
| Approvals | Approve/reject | `/approvals/{type}/{id}` | approval_logs | Yes | Reviewer only | Student can approve | Fail | Critical |
| Notifications | Bell/read | `/notifications` | notifications | Yes | Own notifications | Creation broken/global query | Fail | |
| Exports | CSV/export | `/export/*` | multiple | Yes | Scoped | Global and IDOR | Fail | |
| Settings | Settings page | `GET/PUT /settings` | system_settings | Yes | Admin/coordinator | GET open to supervisor/student | Fail | |
| Analytics | Dashboard | `/analytics/*` | multiple | Yes | Authorized scope | Global to student | Fail | |
| Audit logs | Review history | Generic approval only | approval_logs | Yes | Complete history | Dedicated workflow bypasses log | Fail | |

## 15. Security Test Result

**Critical fail.**

Confirmed:

- IDOR reads on assignments and reports.
- IDOR writes/deletes on attendance, reports, weekly reports, documentation, and exports.
- Privilege escalation through generic approvals.
- Role escalation from Organization Admin to Super Admin.
- Status spoofing to `approved`.
- Global analytics/settings exposure.
- Public unauthenticated documentation media.
- Email changes retain verification.
- Logged-out and invalid tokens are correctly rejected.
- Registration role spoofing is correctly ignored.
- React text interpolation reduces direct stored-XSS execution risk, but browser execution testing was blocked.
- SQL-injection payloads were not observed to bypass Eloquent/validation; no pass is claimed for exhaustive injection testing.

Dependency findings:

- Composer: 21 advisories across 10 packages, including high advisories affecting Laravel, Symfony HTTP Foundation, Symfony MIME, and Symfony Process.
- Frontend npm: 6 advisories, including 4 high (`react-router-dom`, Vite, transitive `form-data`).
- Backend npm: 12 advisories, including 1 high (Axios) and 6 moderate.

## 16. Database Integrity Result

**Partial / fail.**

- Foreign keys and unique attendance constraints exist.
- Fresh migrations complete on SQLite.
- Configured MySQL could not be reached.
- Duplicate company names are allowed.
- Notification migrations create incompatible schemas because the second migration skips alteration when the table already exists.
- Daily export expects a column absent from the daily-report migration.
- Direct approved-state writes undermine logical integrity even where foreign keys remain valid.
- Approval actions are not consistently audited.

## 17. Performance Result

**Acceptable only for the tiny QA dataset; not load-tested.**

| Check | Result |
|---|---:|
| Analytics API average (20 requests) | 215.1 ms |
| Daily reports API average | 224.8 ms |
| Users API average | 237.0 ms |
| Frontend HTML average (10 requests) | 22.6 ms |
| Largest production JS chunk | 970,127 bytes |

The bundle-size warning is significant. No large-dataset, concurrent-user, upload-throughput, or report-generation stress test was possible.

## 18. Production Readiness Result

**Fail.**

- `.env` is not tracked.
- `.env.example` is incomplete: 21 keys used locally are absent.
- `.env.example` defaults to `APP_ENV=local` and `APP_DEBUG=true`.
- No health/readiness endpoint (`/up`, `/health`, `/api/health` all returned `404`).
- No complete deployment, backup, or restore procedure was found.
- 4,117 `node_modules` files are already tracked in Git despite ignore rules.
- Build passes but produces a 970 KB main chunk.
- No lint scripts.
- Test suite is red.
- MySQL service/configuration is not operational in the tested environment.
- Email notification service logs simulated sends.
- Known high-severity dependency vulnerabilities remain.

## 19. Critical Issues — Must Fix Before Real Users

1. Implement Laravel policies and query scopes for every user-owned/organization-owned model.
2. Remove client control of approval/review status.
3. Protect the generic approval endpoint and enforce reviewer assignment.
4. Prevent Organization Admin from assigning Super Admin.
5. Replace all student `localStorage` OJT records with authenticated API/database records.
6. Scope all exports and analytics.
7. Make documentation media private and authorized.

## 20. High Priority Issues

- Repair notification schema/model/service and send real notifications.
- Validate attendance time order and resolve date casting/duplicate `500`.
- Reverify changed email addresses.
- Upgrade vulnerable Laravel/Symfony, React Router, Vite, Axios, and related packages.
- Use one audited approval service for all report/attendance reviews.
- Repair role comparisons and reviewer actions in detail pages.
- Implement real DTR, weekly/monthly/final reports and accurate hours.
- Restore a passing test suite and add authorization regression tests.

## 21. Medium Priority Issues

- Add lint/type/security checks to CI.
- Add duplicate-company policy and constraints.
- Add failed-login lockout/audit behavior.
- Add explicit empty, loading, and API-error states.
- Fix mojibake and low-contrast buttons.
- Add pagination/filter tests for every list.
- Add health/readiness and operational documentation.

## 22. Low Priority Issues

- Split the oversized frontend bundle.
- Reformat one-line legacy page components.
- Remove tracked dependencies and generated runtime files from version control.
- Standardize status labels and role constants.

## 23. Files or Lines Causing Issues

- `backend/routes/api.php:36-145` — many authenticated routes lack role or ownership enforcement.
- `backend/app/Http/Controllers/Api/AttendanceController.php:18-26,32-104,127-137` — global queries, arbitrary assignment mutation, deletion, and unsafe time calculation.
- `backend/app/Http/Requests/AttendanceRequest.php:23-29` — client controls status and approval status.
- `backend/app/Http/Requests/DailyReportRequest.php:25` and `WeeklyReportRequest.php:26` — client can request approved/rejected state.
- `backend/app/Http/Controllers/Api/DailyReportController.php:18,50` — unscoped listing and direct validated create.
- `backend/app/Http/Controllers/Api/WeeklyReportController.php:17,49,64-112` — unscoped listing/generation.
- `backend/app/Http/Controllers/Api/ApprovalController.php:17-56` — no reviewer/ownership authorization.
- `backend/app/Http/Controllers/Api/ExportController.php:16-147` — unscoped exports; nonexistent `hours_worked`.
- `backend/app/Http/Controllers/Api/NotificationController.php:13-18` — global notifications/read.
- `backend/app/Services/NotificationService.php:18-27,51-53` — incompatible insert fields and simulated email.
- `backend/database/migrations/2026_05_03_000011_create_notifications_table.php:10-17` and `2026_05_07_000002_create_notifications_table.php:11-20` — incompatible conditional schemas.
- `backend/app/Http/Controllers/Api/AuthController.php:77-90` — email change does not clear verification.
- `frontend/src/features/studentOjt/ojtStorage.ts:85-104` — local browser source of truth.
- `frontend/src/pages/dashboard/DashboardPage.tsx:44-50` — student dashboard loads local OJT data.
- `frontend/src/pages/attendance/AttendancePage.tsx:15-41` and `TimeInOutPage.tsx:32-54` — local attendance/DTR.
- `frontend/src/pages/reports/WeeklyReportPage.tsx:25-74` — local reports and canned narrative text.
- `frontend/src/pages/documents/DocumentationPage.tsx:33-75` — local documentation list.
- `frontend/src/pages/reports/DailyReportDetailPage.tsx:1` and `WeeklyReportDetailPage.tsx:1` — incorrect lowercase role comparisons and low-contrast actions.
- `frontend/src/pages/public/RegisterPage.tsx:56,130-142` — visible encoding artifacts.

## 24. Commands Run

| Command/check | Result |
|---|---|
| `composer install --no-interaction --prefer-dist` | Pass |
| Root/backend/frontend `npm install` | Pass; advisories found |
| `php artisan migrate:status` using configured MySQL | Blocked: connection refused |
| `php artisan migrate:fresh --seed` on isolated SQLite | Pass |
| `php artisan migrate:status` on isolated SQLite | All migrations ran |
| `php artisan test` | Fail: 5 passed, 2 failed |
| Backend/frontend `npm run lint` | Blocked: scripts missing |
| `npm run build` | Pass; large-chunk warning |
| PHP syntax scan over 95 files | Pass |
| `npm audit` frontend/backend | Fail: high advisories |
| `composer audit` | Fail: 21 advisories |
| `php artisan route:list --path=api -v` | 91 routes inspected |
| Live authenticated API assertions | 54 assertions across RBAC, IDOR, workflows, auth, export, and notifications |
| Real PNG and invalid-file upload checks | Real storage passed; authorization/privacy failed |
| API timing checks | Completed on local QA dataset |
| Browser runtime connection | Blocked: no browser available |

QA data was created only in an isolated temporary SQLite database. The service was stopped and temporary database/uploads were removed after testing. The source working tree was left clean before this report was added.

## 25. Final Recommendation

Do not deploy TrackWise or use it for real student records.

Fix in this order:

1. Build and test a complete policy/ownership layer for assignments, attendance, reports, documentation, notifications, analytics, and exports.
2. Remove all browser-local OJT data and connect the student workflow to the same secured database APIs.
3. Make statuses server-controlled and consolidate approval/audit logic.
4. Repair notifications and private file delivery.
5. Upgrade vulnerable dependencies, restore a passing test/lint pipeline, and configure the real database.
6. Only then complete DTR, monthly/final narratives, PDFs, responsive browser testing, performance testing, and deployment readiness.
