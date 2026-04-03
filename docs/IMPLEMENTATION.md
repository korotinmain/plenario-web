# IMPLEMENTATION.md

## Plenario Frontend Implementation Guide

This document is the canonical implementation guide for the **Plenario frontend**.
It is written for AI-assisted development and should be treated as the source of truth for how the Angular application must be designed, implemented, extended, and reviewed.

It defines:

- product vision for the frontend
- locked v1 scope
- architecture
- UI/UX direction
- Angular conventions
- Material usage rules
- state management rules
- testing expectations
- page-by-page implementation requirements
- increment-by-increment delivery plan
- Definition of Done for AI-generated work

---

# 1. Project Overview

## 1.1 Product name

**Plenario**

## 1.2 Product type

Premium personal planning web application.

## 1.3 Frontend mission

Build a premium Angular frontend that feels like a polished product rather than a CRUD demo.

The frontend must be:

- visually clean
- consistent
- structured
- scalable
- testable
- easy to extend
- aligned with backend domain boundaries

## 1.4 Core priorities

1. Strong architecture
2. Premium UI/UX
3. Incremental delivery
4. Clean Angular patterns
5. Full test coverage for implemented features

---

# 2. Locked Product Scope for Frontend v1

## 2.1 Included in v1

### Authentication

- Register
- Login
- Forgot password
- Reset password
- Email confirmation result page
- Resend email confirmation
- Google auth entry and callback handling
- Logout
- Session bootstrap (`me` flow)

### Protected product areas

- Dashboard
- Projects
- Tasks
- Settings

### Dashboard

- greeting/header
- current date
- summary cards
- today tasks block
- upcoming tasks block
- quick actions

### Projects

- projects list
- create project
- edit project
- delete project
- project details page shell

### Tasks

- tasks list
- create task
- edit task
- delete task
- task details/edit flow
- filters by project/status/priority
- today view
- upcoming view

### Settings

- profile section
- account section
- security section
- change password
- email verification state
- linked providers view
- timezone setting

## 2.2 Excluded from v1

These features must not be introduced early:

- reminders
- notifications
- recurring tasks
- Redis-dependent UI
- collaboration
- comments
- subtasks
- labels/tags
- calendar view
- mobile app
- advanced analytics
- activity log UI
- theme switching if it delays delivery

---

# 3. Product Rules That Affect Frontend Behavior

## 3.1 Authentication rules

1. Credentials users cannot log in until email is confirmed.
2. If login is rejected because email is unverified, the UI must clearly explain the reason.
3. The UI must provide a resend confirmation path.
4. Google auth is treated as trusted provider authentication.
5. Forgot password must not reveal whether the email exists.

## 3.2 Ownership rules

1. Users can only see and manage their own projects and tasks.
2. UI must never assume access to resources outside authenticated user scope.
3. Ownership errors should be handled gracefully.

## 3.3 Project deletion rule

When a project is deleted, tasks are not deleted; they become unassigned.
The UI must not imply that deleting a project deletes tasks unless backend behavior changes in the future.

## 3.4 Task rules

1. Statuses:
   - TODO
   - IN_PROGRESS
   - DONE

2. Priorities:
   - LOW
   - MEDIUM
   - HIGH

3. The UI must clearly represent status and priority.
4. Today and Upcoming views are important first-class views, not secondary filters.

---

# 4. Frontend Product Experience Goals

## 4.1 Desired product feel

Plenario should feel:

- premium
- minimal
- calm
- structured
- modern
- intentional

## 4.2 What the UI must avoid

- default-looking Angular Material demo UI
- cluttered dashboards
- inconsistent spacing
- overloaded screens
- visually noisy cards and actions
- weak empty states
- unclear error messages
- giant forms with no hierarchy

## 4.3 UX principles

1. Fast paths first
2. Low friction forms
3. Clear system feedback
4. Strong visual hierarchy
5. Consistency over novelty
6. Readability over density
7. Reuse existing patterns before inventing new ones

---

# 5. Frontend Tech Stack

## 5.1 Required stack

- Angular
- Angular standalone APIs
- Angular Material
- RxJS
- Reactive Forms
- SCSS

## 5.2 Strong recommendations

- Angular signals may be used carefully where they improve clarity, but must not fragment state patterns
- keep feature state service/store based
- prefer clean typed models and facades over ad hoc streams in components

## 5.3 UI library requirement

**Angular Material is mandatory as the base UI library.**

Use Material components wherever applicable:

- buttons
- dialogs
- form fields
- inputs
- selects
- menus
- cards
- icons
- snackbars
- dividers
- progress indicators
- tabs, only if truly useful

Custom styling on top of Material is expected.
Custom replacement of Material primitives is discouraged unless clearly necessary.

---

# 6. Frontend Architecture

## 6.1 Architecture style

- feature-based
- modular
- scalable
- explicit boundaries
- testable

## 6.2 High-level structure

```text
src/app/
  core/
    auth/
    config/
    guards/
    interceptors/
    layout/
    services/
    tokens/

  shared/
    ui/
    components/
    models/
    utils/
    pipes/
    constants/

  features/
    auth/
      pages/
      components/
      data-access/
      models/
      utils/

    dashboard/
      pages/
      components/
      data-access/
      models/

    projects/
      pages/
      components/
      data-access/
      models/

    tasks/
      pages/
      components/
      data-access/
      models/

    settings/
      pages/
      components/
      data-access/
      models/
```

## 6.3 Layer responsibilities

### core

Cross-cutting app concerns:

- auth/session bootstrap
- HTTP interceptors
- route guards
- app configuration
- layout shell primitives
- global services

### shared

Reusable presentation and helper utilities:

- shared UI components
- reusable models
- formatting utilities
- common helper functions
- generic presentational elements

### features

Feature-specific pages, components, models, stores, and API services.
Each feature should own its UI and orchestration logic.

---

# 7. Component Design Rules

## 7.1 Component categories

Use the following practical split:

- page components
- smart/container components when needed
- presentational components
- dialog components
- shared UI components

## 7.2 Page components

Page components may:

- read route params
- coordinate feature stores/services
- open dialogs
- compose page sections
- orchestrate page-level loading/error states

Page components should not:

- contain large inline business logic
- contain raw HTTP logic
- become giant monolith components

## 7.3 Presentational components

Presentational components should:

- receive data through inputs
- emit events through outputs
- remain reusable within or across features
- avoid direct service dependencies where practical

## 7.4 Dialog components

Dialog components should be:

- compact
- focused
- single-purpose
- easy to close and understand

Use dialogs for:

- create/edit flows that fit compactly
- confirmations
- destructive actions
- focused forms

Do not use dialogs for:

- large page-sized workflows
- deeply nested flows
- information-heavy navigation

## 7.5 Shared UI components

Shared UI must be:

- reusable
- styling-consistent
- generic
- not coupled to a specific feature backend endpoint

Examples:

- empty state block
- section header
- stat card
- page header
- form action row
- confirmation dialog shell

---

# 8. Angular Material Rules

## 8.1 Material as the default foundation

Use Angular Material as the default UI foundation for all standard controls.

## 8.2 Required Material usage

- buttons → `mat-button`, `mat-raised-button`, `mat-stroked-button`, `mat-icon-button`
- dialogs → `MatDialog`
- forms → `mat-form-field`
- text inputs → `matInput`
- selects → `mat-select`
- menus → `mat-menu`
- cards → `mat-card`
- icons → `mat-icon`
- snackbars → `MatSnackBar`
- progress → `mat-progress-bar` / `mat-spinner`
- lists where appropriate → `mat-list`
- chips if used later → Material chips, not custom from scratch

## 8.3 Material design constraints

- Material must not look unstyled or default-demo quality
- refine spacing, density, elevation, shape, and hierarchy
- apply product styling consistently across Material-based components
- do not create one-off styles per page

## 8.4 Material usage anti-patterns

Do not:

- build custom buttons when Material buttons are enough
- replace dialog logic with random overlay implementations
- use tables by default when list/card layout is better
- over-nest Material cards inside other cards without purpose

---

# 9. State Management Rules

## 9.1 State strategy for v1

Use lightweight feature-level state with RxJS.

Recommended pattern:

- feature data-access service for API communication
- feature store/facade service for state orchestration
- page component binds to observables
- presentational components stay stateless where practical

## 9.2 State principles

- keep state local to the feature when possible
- avoid global state unless clearly necessary
- avoid premature NgRx introduction
- avoid manual subscriptions in components when async pipe is enough
- derive view state instead of duplicating it

## 9.3 Store responsibilities

Feature store/facade may manage:

- loading state
- error state
- list/detail data
- local filter state
- orchestration of dialog results and refreshes

Store/facade should not:

- contain raw Material UI code
- become a hidden dumping ground for unrelated logic

---

# 10. Data Access Rules

## 10.1 Strict rule

Components must not use `HttpClient` directly.

## 10.2 API location

All API communication must live in feature `data-access` services or core auth/config services where appropriate.

## 10.3 Contracts

Use explicit typed request/response contracts.
Do not rely on `any`.

## 10.4 Mapping

If backend DTOs need transformation for UI clarity, do it in a predictable mapping layer or service helper.
Do not spread mapping logic across multiple templates.

---

# 11. Forms Rules

## 11.1 Form strategy

Use **Reactive Forms only**.

## 11.2 Requirements

- strongly typed forms
- validation rules declared clearly
- validation messages shown consistently
- submit disabled during invalid or pending state when appropriate
- proper loading/submitting state
- clear success and error feedback

## 11.3 Form UX expectations

- avoid visually dense forms
- use grouping and spacing
- use clear field labels
- use concise helper text only when valuable
- surface business errors in a visible but non-chaotic way

## 11.4 Password-related forms

Register, login, reset password, and change password flows must:

- clearly show field labels
- handle backend validation safely
- distinguish between validation errors and server/business rule errors

---

# 12. Routing and Navigation

## 12.1 Routing principles

- organize routes by feature
- lazy load feature areas where beneficial
- use guards for auth/public routing
- keep route naming short and predictable
- keep route definitions centralized and readable

## 12.2 Public routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/confirm-email`
- `/auth/google/callback`

## 12.3 Protected routes

- `/dashboard`
- `/projects`
- `/projects/:id`
- `/tasks`
- `/tasks/today`
- `/tasks/upcoming`
- `/settings`

## 12.4 Default routing behavior

- unauthenticated users redirect to login
- authenticated users redirect away from public auth screens when appropriate
- post-login default route should be dashboard unless product decision changes later

---

# 13. Layout Requirements

## 13.1 App shell structure

Authenticated area should use a consistent application shell.
Recommended structure:

- left sidebar or navigation rail
- top header or page header zone
- central content container

## 13.2 Public layout

Auth-related pages should use a dedicated public layout with:

- focused content width
- strong visual hierarchy
- premium but simple presentation
- no clutter

## 13.3 Protected layout

Protected layout should provide:

- navigation
- content rhythm
- consistent page padding
- responsive behavior
- predictable action placement

## 13.4 Page structure guideline

Each major page should include:

- page header
- optional subtitle/supporting text
- primary actions
- content area
- loading/empty/error states

---

# 14. UI/UX Best Practices

## 14.1 Global UI/UX rule

The UI must feel premium and production-ready.
Default-looking generated layouts are not acceptable.

## 14.2 Visual direction

- minimal
- premium
- dark-friendly
- calm
- structured
- refined

## 14.3 Interface priorities

- typography
- spacing
- hierarchy
- consistency
- clarity
- predictable interaction

## 14.4 Required UX states

Every significant feature must define and implement:

- loading state
- empty state
- error state
- success feedback where relevant

## 14.5 Lists and data presentation

For v1 prefer:

- readable list/card layouts
- action clarity
- lightweight visual grouping

Avoid defaulting to:

- dense enterprise tables
- high-noise dashboards
- visually flat forms

## 14.6 Feedback patterns

Use:

- inline validation for field errors
- snackbar for lightweight success feedback where appropriate
- visible page/system error block for larger failures
- confirmation dialogs for destructive actions

## 14.7 Empty state requirements

Empty states should:

- explain what the area is for
- guide next action
- look intentional and polished
- not feel like temporary placeholders

---

# 15. Accessibility Requirements

## 15.1 Baseline accessibility

All major flows must meet a solid baseline:

- keyboard accessible controls
- visible focus states
- labeled form fields
- accessible icon-only buttons
- semantic page structure
- color not used as the only meaning carrier

## 15.2 Dialog accessibility

Dialogs must:

- have clear title
- support keyboard navigation
- close predictably
- return focus appropriately where possible

---

# 16. Performance and Angular Quality Rules

## 16.1 Performance expectations

- use `OnPush` where practical
- use `trackBy` for repeated lists
- avoid expensive template logic
- keep templates readable

## 16.2 Subscription hygiene

- prefer `async` pipe when possible
- avoid manual subscriptions in components unless necessary
- clean up manual subscriptions properly

## 16.3 Code quality expectations

- strongly typed models
- small focused components
- explicit code over clever code
- no `any` unless truly unavoidable
- readable templates
- consistent naming

---

# 17. Testing Requirements

## 17.1 Global rule

**Everything implemented must be covered with tests.**

## 17.2 Required frontend test coverage

At minimum, include:

- unit tests for services and stores
- guard tests
- form validation tests
- interaction tests for critical UI flows
- utility tests for formatting/mapping logic

## 17.3 Focus of tests

Tests must validate behavior, not implementation trivia.

Good test targets:

- auth state behavior
- validation scenarios
- guard routing decisions
- store loading/error/success transitions
- dialog result handling
- task filter logic
- settings form behavior

Avoid low-value tests that merely assert framework boilerplate.

## 17.4 Testing principles

- tests must be readable
- tests must be maintainable
- tests must reflect actual product rules
- do not skip tests for logic-heavy code

---

# 18. Feature-by-Feature Requirements

# 18.1 Auth Feature

## Pages

- login page
- register page
- forgot password page
- reset password page
- confirm email result page
- Google callback page/handler

## Required behaviors

### Register

- email field
- password field
- optional name field
- submit state
- success guidance after registration
- explain that email confirmation is required before login

### Login

- email field
- password field
- Google login option
- clear error handling
- explicit handling for unverified email response
- visible resend confirmation entry point

### Forgot password

- email field
- generic success state regardless of email existence

### Reset password

- new password form
- token-based flow
- expired/invalid token state
- success state with next-step guidance

### Confirm email

- success state
- failure state
- invalid/expired token state
- clear navigation path to login after success

## Components likely needed

- auth form shell
- auth page layout
- resend confirmation block
- auth error alert
- password field component if helpful and reusable

---

# 18.2 Dashboard Feature

## Page requirements

Dashboard must include:

- greeting/header
- current date
- summary cards
- today tasks section
- upcoming tasks section
- quick actions

## Summary cards

Recommended cards:

- total projects
- open tasks
- tasks due today
- upcoming tasks

## UX requirements

- useful with little data
- polished empty states
- quick scan readability
- avoid clutter

## Components likely needed

- dashboard summary card
- tasks preview list
- quick action panel
- section header

---

# 18.3 Projects Feature

## Page requirements

### Projects list page

- list projects
- create project action
- edit project action
- delete project action
- empty state

### Project details page

- project header
- project metadata
- linked tasks preview or section shell
- edit/delete actions

## Dialogs

Projects can use dialogs for create/edit flows if compact and clean.
Delete confirmation should use dialog.

## UX requirements

- project creation should be fast
- list should be clear and readable
- destructive actions should not dominate the UI

## Components likely needed

- project list item/card
- project form dialog
- project delete confirmation
- project header block

---

# 18.4 Tasks Feature

## Page requirements

### Tasks list page

- list tasks
- create task
- edit task
- delete task
- filter by project/status/priority
- empty state

### Today page

- tasks due today
- clear sectioning or list layout
- incomplete tasks prioritized visually

### Upcoming page

- future tasks only
- sorted by nearest due date

## Task representation requirements

Each task item should clearly communicate:

- title
- status
- priority
- due date if present
- project if assigned

## Task create/edit UX

May use dialogs if the flow stays compact enough.
If a dedicated page is better for clarity, prefer clarity over forced dialog use.

## Components likely needed

- task list item/card
- task filters bar
- task form dialog or form section
- status chip
- priority chip
- due-date display

---

# 18.5 Settings Feature

## Page requirements

Sections:

- Profile
- Account
- Security

## Profile section

- name
- avatar URL optional if included in UI
- timezone

## Account section

- email
- email verification status
- linked providers
- resend confirmation if relevant

## Security section

- change password form for credentials users only

## UX requirements

- compact and well-structured
- section separation should be clear
- no cluttered mega-form page

## Components likely needed

- settings section card
- profile form
- account info block
- change password form

---

# 19. Incremental Implementation Strategy

Development must be done in **increments**.
Each increment must produce coherent, test-covered, end-to-end usable progress.

## Increment 0 — Frontend Foundation

### Goals

Set up architecture and reusable foundations without implementing full business features.

### Deliverables

- Angular application setup
- routing foundation
- public layout
- protected layout shell
- shared UI foundation
- Material theme setup
- global spacing/typography foundations
- core folder structure
- test setup baseline

### Required outputs

- app shell renders
- route placeholders exist
- shared layout conventions established
- no business logic yet beyond session bootstrapping skeleton if needed

### Tests

- basic shell/component tests
- routing guard scaffolding tests if introduced

---

## Increment 1 — Auth Core

### Goals

Implement register, login, route protection, and session bootstrap.

### Deliverables

- register page
- login page
- auth API service
- auth store/facade
- auth guard
- public/auth redirect logic
- session bootstrap using `me`

### Critical rules

- unverified email must be handled explicitly in UI
- resend confirmation path must be planned into UX

### Tests

- auth service tests
- auth facade/store tests
- guard tests
- register/login form validation tests
- UI interaction tests for primary auth flows

---

## Increment 2 — Email Confirmation and Password Recovery

### Goals

Complete credentials auth lifecycle.

### Deliverables

- confirm email result page
- resend confirmation flow
- forgot password page
- reset password page
- success and error states

### Tests

- form tests
- token-state page tests
- resend confirmation behavior tests
- forgot password generic success behavior tests

---

## Increment 3 — Google Auth

### Goals

Support Google auth initiation and callback handling.

### Deliverables

- Google sign-in button integration
- callback handling route/page
- session completion flow
- error handling for callback failures

### Tests

- callback handling logic tests
- auth state transition tests

---

## Increment 4 — Projects

### Goals

Implement projects management UI.

### Deliverables

- projects list page
- project create dialog/page
- project edit dialog/page
- project delete confirmation
- project details page shell

### Tests

- projects data-access tests
- projects store tests
- project form tests
- dialog interaction tests

---

## Increment 5 — Tasks

### Goals

Implement tasks management and core planning views.

### Deliverables

- tasks list page
- today page
- upcoming page
- task create/edit flow
- task delete confirmation
- filters UI

### Tests

- tasks data-access tests
- store/filter logic tests
- task form tests
- today/upcoming view behavior tests

---

## Increment 6 — Dashboard and Settings

### Goals

Complete the core product feeling.

### Deliverables

- dashboard page
- summary cards
- today/upcoming preview blocks
- settings page
- profile/account/security sections
- change password flow

### Tests

- dashboard state tests
- settings service/store tests
- change password form tests
- account state rendering tests

---

## Increment 7 — Polish and Hardening

### Goals

Raise product quality to release-ready v1 level.

### Deliverables

- loading/empty/error pass across all features
- UI consistency pass
- accessibility pass
- copy consistency pass
- visual cleanup
- test coverage hardening

### Tests

- fill remaining gaps
- stabilize brittle tests
- verify critical flows end-to-end at the component/service level

---

# 20. Naming Conventions

## Files and folders

- use kebab-case for folders and file names
- feature folders should be clear and short

## Classes and interfaces

- components/services/classes → PascalCase
- interfaces/models → PascalCase
- enums → PascalCase
- enum members → uppercase style where appropriate

## Service naming

- API services end with `ApiService` when they primarily communicate with backend
- feature state/orchestration services end with `Store` or `Facade`
- generic helpers end with `Service` only if they are true services

---

# 21. Definition of Done for Frontend Work

A frontend task is not done unless:

- it matches current increment scope
- Angular Material is used appropriately
- architecture boundaries are respected
- code is strongly typed
- tests are implemented
- loading state exists where needed
- empty state exists where needed
- error state exists where needed
- success feedback exists where relevant
- UI looks coherent and polished
- accessibility baseline is respected

---

# 22. AI-Specific Instructions

## 22.1 Scope discipline

AI must implement only the current increment.
Do not pull future features into the current task.

## 22.2 Architecture discipline

AI must preserve:

- feature boundaries
- state boundaries
- data-access boundaries
- shared component reusability

## 22.3 UI discipline

AI must not generate:

- generic demo UI
- inconsistent spacing
- random component patterns
- cluttered pages

## 22.4 Testing discipline

AI must always include tests for implemented logic and feature behavior.
No feature is complete without tests.

## 22.5 Reuse discipline

Before creating a new UI pattern, AI should reuse an existing one if it fits.
Do not introduce multiple competing visual patterns for the same purpose.

---

# 23. Suggested Initial Implementation Order

For the frontend, the most practical order is:

1. Increment 0 — foundation
2. Increment 1 — auth core
3. Increment 2 — confirmation + recovery
4. Increment 3 — Google auth
5. Increment 4 — projects
6. Increment 5 — tasks
7. Increment 6 — dashboard + settings
8. Increment 7 — polish

This order should be treated as default unless there is a strong implementation reason to deviate.

---

# 24. Final Summary

Plenario frontend must be built as a premium Angular application with:

- Angular Material as the required base UI layer
- feature-based architecture
- Reactive Forms only
- test coverage for all implemented features
- explicit loading/empty/error/success states
- incremental delivery discipline
- polished UI/UX as a hard requirement

This file should be used by AI as the primary implementation guide for the frontend repository.
