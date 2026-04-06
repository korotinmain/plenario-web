# Frontend Tasks — Progress Tracker

Use this file to track increment progress. Update status as work is completed.

## Status legend

- `[ ]` Not started
- `[x]` Completed
- `[~]` In progress

---

## Increment 0 — Frontend Foundation ✅ COMPLETED

**Date completed:** 2026-04-03

### Deliverables

- [x] Angular application setup (Angular 21, standalone)
- [x] Angular Material installed (v21.2.5, M3 theme)
- [x] Material theme — violet palette, Inter font, density -1
- [x] Global SCSS — spacing variables, typography, utility classes
- [x] `index.html` — Inter font, Plenario title
- [x] App root component — clean router outlet shell
- [x] `app.config.ts` — provideRouter, provideAnimationsAsync, provideHttpClient
- [x] **Core folder structure** — core/, shared/, features/ with full feature sub-folders
- [x] **Auth service** — BehaviorSubject-based session state, bootstrapSession() stub
- [x] **Auth models** — User, AuthProvider, AuthState interfaces
- [x] **Auth guard** — redirects unauthenticated users to /login
- [x] **Public guard** — redirects authenticated users to /dashboard
- [x] **Routing foundation** — all feature routes declared with lazy loading
  - Public routes: /login, /register, /forgot-password, /reset-password
  - Standalone: /confirm-email
  - Protected routes: /dashboard, /projects, /projects/:id, /tasks, /tasks/today, /tasks/upcoming, /settings
- [x] **Public layout** — centered card, brand, router outlet
- [x] **Protected layout** — Material sidenav, sidebar nav (Dashboard/Projects/Tasks/Settings), content area
- [x] **Shared UI components:**
  - `EmptyStateComponent` — icon, title, message, content projection
  - `PageHeaderComponent` — title, subtitle, actions slot
  - `SectionHeaderComponent` — uppercase label, actions slot
  - `StatCardComponent` — label, value, optional icon
- [x] **Feature placeholder pages** (shell stubs for all routes):
  - Auth: Login, Register, ForgotPassword, ResetPassword, ConfirmEmail
  - Dashboard: DashboardComponent
  - Projects: ProjectsListComponent, ProjectDetailsComponent
  - Tasks: TasksListComponent, TasksTodayComponent, TasksUpcomingComponent
  - Settings: SettingsComponent
- [x] **Auth data-access stub** — AuthApiService skeleton
- [x] **Test baseline:**
  - AuthService spec — state, setUser, clearSession, bootstrapSession
  - authGuard spec — redirect to /login when unauthenticated, allow when authenticated
  - publicGuard spec — allow when unauthenticated, redirect to /dashboard when authenticated
  - PublicLayoutComponent spec — creates, shows brand, has router-outlet
  - ProtectedLayoutComponent spec — creates, shows logo, lists all nav items
  - EmptyStateComponent spec — title, message, icon inputs
  - PageHeaderComponent spec — title, subtitle conditional rendering
  - App spec — creates component, has router-outlet

---

## Increment 1 — Auth Core ✅ COMPLETED

**Date completed:** 2026-04-03

### Deliverables

- [x] Register page — full form (name optional, email, password with show/hide)
- [x] Register success state — "check your inbox" screen
- [x] Login page — full form (email, password, Google button)
- [x] Unverified email banner — explicit UI state with resend confirmation inline
- [x] Auth API service — register, login, me, logout, forgotPassword, resetPassword, resendConfirmation, googleLogin
- [x] Auth store — loading/error/success state for register, login, resend; LoginError type detection
- [x] Session bootstrap — APP_INITIALIZER calls /auth/me before app renders, graceful 401 fallback
- [x] AuthService — real /auth/me HTTP call with withCredentials
- [x] PasswordFieldComponent — show/hide toggle, Material errors for required/minlength
- [x] Auth request/response models — RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest, ResendConfirmationRequest, AuthResponse, MessageResponse

### Tests

- [x] AuthService spec — bootstrapSession success/401/network-error, setUser, clearSession (9 tests)
- [x] AuthApiService spec — all HTTP methods (register, login, me, logout, forgotPassword, resetPassword, resendConfirmation) with correct URL/method/credentials (8 tests)
- [x] AuthStore spec — register success/error, login success/unverified/invalid_credentials/unknown, resend success/error, logout, reset state methods (11 tests)
- [x] RegisterComponent spec — form validation, submit behavior, success state, error display, destroy cleanup (9 tests)
- [x] LoginComponent spec — form validation, submit behavior, unverified banner, resend, Google login, destroy cleanup (11 tests)

**Total Increment 1 tests: 48 (cumulative total: 70)**

---

## Increment 2 — Email Confirmation and Password Recovery ✅ COMPLETED

**Date completed:** 2026-04-06

### Deliverables

- [x] Confirm email result page — 4 states: loading / success / error / no-token
- [x] Resend confirmation flow — inline in login unverified-email banner
- [x] Forgot password page — Tailwind inputs, success state, back link
- [x] Reset password page — dual password fields, token from query param, 4 states
- [x] Route redirects — `auth/confirm-email` → `confirm-email`, `auth/reset-password` → `reset-password` (backend email links)
- [x] Auth store — forgotPassword and resetPassword loading/error/success state
- [x] Auth API — `confirmEmail(token)` GET, `forgotPassword`, `resetPassword` wired

---

## Increment 3 — Google Auth ✅ COMPLETED

**Date completed:** 2026-04-06

### Deliverables

- [x] Google sign-in button on login page with `googleLogin()` → `window.location.href`
- [x] `auth/google/callback` route — outside both guards, before wildcard
- [x] `GoogleCallbackComponent` — reads `?accessToken=` from URL, stores token, calls `/auth/me`, navigates to dashboard or login
- [x] JWT token persistence — `AuthService.setToken/getToken/clearToken` (localStorage `pln_access_token`)
- [x] `authInterceptor` — functional interceptor adds `Authorization: Bearer <token>` to all API requests
- [x] `bootstrapSession` — skips HTTP call if no token, clears token on 401
- [x] Login stores `accessToken` from response via `setToken()`
- [x] `clearSession()` now also calls `clearToken()`

---

## Increment 4 — Projects ✅ COMPLETED

**Date completed:** 2026-04-06

### Deliverables

- [x] `Project` model — `id, name, description, status, color, createdAt, updatedAt`
- [x] `ProjectStatus` type — `active | on_hold | completed | archived`
- [x] `ProjectsApiService` — `getAll, getById, create, update, delete`
- [x] `ProjectsStore` — `load, create, update, delete` with loading/error/saving state + snackbar feedback
- [x] `ProjectFormDialogComponent` — create dialog with name, description, color picker
- [x] `EditProjectDialogComponent` — edit dialog with name, description, status chips, color picker
- [x] `DeleteProjectDialogComponent` — confirmation dialog with project name
- [x] `ProjectsListComponent` — grid of project cards, loading/empty/error states, create/edit/delete actions
- [x] `ProjectDetailsComponent` — loads project by id, edit inline, back link, tasks placeholder
- [x] Status badge styles — active/on_hold/completed/archived with color coding

### Notes

- Backend `/projects` API not yet implemented — UI is ready, will 404 until backend ships
- Color bar per card (4px top strip in project color)
- Menu with edit/delete per card

---

## Increment 5 — Tasks [ ]

### Deliverables

- [ ] Tasks list page — full implementation
- [ ] Today page — tasks due today
- [ ] Upcoming page — future tasks sorted by date
- [ ] Task create/edit flow
- [ ] Task delete confirmation
- [ ] Filters UI (project, status, priority)
- [ ] Tasks API service
- [ ] Tasks store

### Tests

- [ ] Tasks data-access tests
- [ ] Store/filter logic tests
- [ ] Task form tests
- [ ] Today/upcoming view behavior tests

---

## Increment 6 — Dashboard and Settings [ ]

### Deliverables

- [ ] Dashboard page — greeting, date, summary cards, today/upcoming blocks, quick actions
- [ ] Dashboard API/store for summary data
- [ ] Settings page — profile, account, security sections
- [ ] Profile form — name, timezone
- [ ] Account info block — email, verification status, linked providers
- [ ] Security section — change password form (credentials users only)
- [ ] Settings API service and store

### Tests

- [ ] Dashboard state tests
- [ ] Settings service/store tests
- [ ] Change password form tests
- [ ] Account state rendering tests

---

## Increment 7 — Polish and Hardening [ ]

### Deliverables

- [ ] Loading/empty/error states pass across all features
- [ ] UI consistency pass
- [ ] Accessibility pass
- [ ] Copy consistency pass
- [ ] Visual cleanup
- [ ] Test coverage hardening

### Tests

- [ ] Fill remaining gaps
- [ ] Stabilize any brittle tests
- [ ] Verify critical flows end-to-end
