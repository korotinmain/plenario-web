# AGENTS.md (Frontend)

## Stack

- Angular (standalone)
- Angular Material (required UI library)
- RxJS

## UI Library Requirement (CRITICAL)

All UI must be built using Angular Material components where applicable:

- buttons → `mat-button`, `mat-raised-button`, `mat-icon-button`
- dialogs → `MatDialog`
- inputs → `mat-form-field`, `mat-input`
- selects → `mat-select`
- menus → `mat-menu`
- cards → `mat-card`
- lists → `mat-list`
- snackbars → `MatSnackBar`
- icons → `mat-icon`

Do not build custom primitives if Material already provides them.
Custom styling is allowed on top of Material.

## Architecture rules

- feature-based structure
- separate pages, components, data-access
- shared UI components must be reusable and generic
- API logic must be isolated in services
- do not mix UI and API logic

## State management

- use simple service-based state (RxJS)
- avoid NgRx unless necessary

## Forms

- use Angular Reactive Forms
- strongly typed forms
- consistent validation

## UX expectations

- premium UI (clean, minimal, structured)
- consistent spacing and typography
- proper loading states
- proper empty states
- proper error states

## Auth UX rules

- handle unverified email explicitly
- show resend confirmation option
- clear validation messages

## Coding rules

- strongly typed models
- avoid large components
- prefer composition over inheritance
- keep templates clean and readable

## Increment rule

Build only current increment scope.
Do not introduce future features.

## Visual consistency rule

Do not introduce new visual patterns if an existing one already exists in the app.
Reuse patterns before creating new ones.

Follow FRONTEND_TASKS.md and IMPLEMENTATION.md files, follow increements and note in .md document you progress to have opportunity to always continue your work.
