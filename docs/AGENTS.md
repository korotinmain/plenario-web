# AGENTS.md (Frontend)

## Stack

- Angular (standalone)
- Angular Material (required UI library)
- Tailwind CSS v4 (utility-first styling)
- RxJS

## UI Library Requirement (CRITICAL)

**Prefer Tailwind-first for form inputs and layout.** Use Angular Material for interactive/overlay components.

### Tailwind components (prefer these)

- text inputs, password fields → `<tw-input-field>`, `<app-password-field>` (shared/ui)
- layout, spacing, flex/grid → Tailwind utility classes
- custom cards, banners, stat cards → Tailwind utility classes
- badges, tags, pills → Tailwind utility classes
- typography, colors → Tailwind utility classes

### Angular Material components (use for complex interactive UI)

- buttons → `mat-button`, `mat-raised-button`, `mat-icon-button`
- dialogs → `MatDialog`
- selects → `mat-select`
- menus → `mat-menu`
- lists → `mat-list`
- snackbars → `MatSnackBar`
- icons → `mat-icon`
- date pickers, sliders, tabs → respective Material components

Do not use `mat-form-field` / `mat-input` for new inputs — use `<tw-input-field>` instead.
Do not build custom primitives if Tailwind utility composition already covers it.
Custom SCSS is allowed on top of both Material and Tailwind where needed.

### Tailwind usage rules

- Tailwind v4 is configured via `src/tailwind.css` (`@import "tailwindcss"`) — no `tailwind.config.js` needed.
- Bridge CSS variables (`--pln-input-ring`, `--pln-input-border`, `--pln-error-ring`, `--pln-error-border`) are defined in `src/tailwind.css @layer base` and link Material theme tokens to Tailwind arbitrary values.
- Use `[class.utility]` binding syntax in Angular templates for conditional Tailwind classes.
- Avoid mixing Tailwind utilities and SCSS rules on the same element — pick one approach per component.

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
