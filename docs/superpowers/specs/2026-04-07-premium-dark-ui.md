# Plenario — Premium Dark UI/UX Redesign

**Status:** Approved for implementation  
**Visual companion:** http://localhost:7788/dark-preview.html

---

## 1. Goal

Elevate Plenario's visual quality from "well-built" to "premium dark SaaS."  
Keep the existing dark sidebar. Flip the content area to full dark. Add glass morphism on modals. Use blue as the single interactive accent. Dense layout with rich micro-interactions.

**Design inspiration:** Linear.app density × Vercel dark aesthetics × blue accent as functional signal.

---

## 2. Design Decisions

| Dimension | Decision |
|---|---|
| Theme | Full dark throughout |
| Accent color | Blue (`#2563eb` / `#3b82f6`) — only used for interactive/active/CTA |
| Content background | `#07080c` (dark blue-tinted near-black) |
| Card surface | Glass — `rgba(255,255,255,0.035)` + `rgba(255,255,255,0.07)` border |
| Modal overlay | `backdrop-filter: blur(20px)` |
| Layout density | Dense / tight (linear.app-style) |
| Micro-interactions | Yes — hover lifts, color transitions, animated state changes |

---

## 3. Color Token Changes

All changes live in `src/styles/_tokens.scss`.

### Content area tokens

```scss
// OLD → NEW
--pln-page-bg:      #f4f4f5           → #07080c
--pln-card-bg:      #ffffff           → rgba(255, 255, 255, 0.035)
--pln-card-border:  #e4e4e7           → rgba(255, 255, 255, 0.07)
--pln-card-shadow:  0 1px 2px ...     → 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)
```

### Text hierarchy tokens

```scss
--pln-text-1: #18181b   → rgba(255, 255, 255, 0.95)
--pln-text-2: #3f3f46   → rgba(255, 255, 255, 0.65)
--pln-text-3: #71717a   → rgba(148, 163, 184, 0.6)
--pln-text-4: #a1a1aa   → rgba(255, 255, 255, 0.3)
```

### Status badge tokens (dark variants)

```scss
// Active: green on dark
--pln-status-active-bg:     #ecfdf5        → rgba(16, 185, 129, 0.12)
--pln-status-active-color:  #059669        → #34d399
--pln-status-active-border: #a7f3d0        → rgba(16, 185, 129, 0.2)

// On hold: amber on dark
--pln-status-hold-bg:       #fffbeb        → rgba(245, 158, 11, 0.10)
--pln-status-hold-color:    #b45309        → #fbbf24
--pln-status-hold-border:   #fde68a        → rgba(245, 158, 11, 0.18)

// Done: blue-tinted (matches accent)
--pln-status-done-bg:       #eff6ff        → rgba(37, 99, 235, 0.12)
--pln-status-done-color:    #1d4ed8        → #93c5fd
--pln-status-done-border:   #bfdbfe        → rgba(59, 130, 246, 0.18)

// Archived: zinc on dark
--pln-status-archived-bg:     #f4f4f5      → rgba(255, 255, 255, 0.05)
--pln-status-archived-color:  #71717a      → rgba(255, 255, 255, 0.35)
--pln-status-archived-border: #e4e4e7      → rgba(255, 255, 255, 0.08)
```

### New card hover token

```scss
--pln-card-hover-border: rgba(59, 130, 246, 0.25)
--pln-card-hover-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1)
```

---

## 4. Material Theme Changes

File: `src/styles/_theme.scss`

### 4a. Switch to dark theme

```scss
html {
  @include mat.theme((
    color: (
      primary: mat.$blue-palette,
      tertiary: mat.$cyan-palette,
      theme-type: dark,        // ← was: light
    ),
    typography: Inter,
    density: -1,
  ));
}
```

### 4b. Body background

```scss
body {
  color-scheme: dark;          // ← was: light
  background-color: #07080c;   // override --mat-sys-surface for our dark tone
  color: rgba(255, 255, 255, 0.95);
  font-family: 'Inter', sans-serif;
  margin: 0;
  height: 100%;
}
```

### 4c. Form field overrides (dark)

Update `mat.form-field-overrides` in `_theme.scss`:

```scss
@include mat.form-field-overrides((
  outlined-container-shape:          16px,
  outlined-outline-width:            1.5px,
  outlined-focus-outline-width:      2px,

  // Border colors
  outlined-outline-color:            rgba(255,255,255,0.08),
  outlined-hover-outline-color:      rgba(255,255,255,0.15),
  outlined-focus-outline-color:      var(--mat-sys-primary),
  outlined-error-outline-color:      var(--mat-sys-error),
  outlined-error-hover-outline-color:  var(--mat-sys-error),
  outlined-error-focus-outline-color:  var(--mat-sys-error),

  // Label colors
  outlined-label-text-color:         rgba(148,163,184,0.6),
  outlined-hover-label-text-color:   rgba(255,255,255,0.55),
  outlined-focus-label-text-color:   var(--mat-sys-primary),
  outlined-error-label-text-color:   var(--mat-sys-error),
  outlined-error-focus-label-text-color:  var(--mat-sys-error),
  outlined-error-hover-label-text-color:  var(--mat-sys-error),

  // Input text & placeholder
  outlined-input-text-color:         rgba(255,255,255,0.9),
  outlined-input-text-placeholder-color: rgba(255,255,255,0.25),
  outlined-caret-color:              var(--mat-sys-primary),

  subscript-text-size:               0.75rem,
  subscript-text-line-height:        1.5
));
```

### 4d. Dialog surface

Update `_tokens.scss`:

```scss
.mat-mdc-dialog-surface {
  border-radius: 20px !important;
  background: rgba(10, 12, 18, 0.92) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
}
```

Add overlay backdrop blur:

```scss
.cdk-overlay-backdrop.cdk-overlay-dark-backdrop {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.6);
}
```

---

## 5. Protected Layout Changes

File: `src/app/core/layout/protected-layout/protected-layout.component.scss`

### 5a. Sidebar — strengthen the existing glow

The sidebar background (`#0d1117`) stays. Strengthen:
- Radial glow `::before`: increase opacity from `0.16` → `0.22`, size from `240px` → `280px`
- Brand icon box-shadow: keep existing, add `inset 0 1px 0 rgba(255,255,255,0.08)` for a top-highlight

### 5b. Content area

```scss
.app-content {
  background-color: #07080c !important;
}
```

---

## 6. Projects List Changes

File: `src/app/features/projects/pages/projects-list/projects-list.component.scss`

### 6a. Card hover — add blue border glow

Add `border-color: var(--pln-card-hover-border)` and `box-shadow: var(--pln-card-hover-shadow)` to the existing `.pcard:hover` rule.

### 6b. Filter tabs active state

```scss
.filter-tab--active {
  background: rgba(37, 99, 235, 0.18);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.2);
  font-weight: 600;

  .filter-tab__count {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
  }
}
```

---

## 7. Public Layout / Auth Changes

File: `src/app/core/layout/public-layout/public-layout.component.scss`

### 6a. Form panel background

```scss
.form-panel {
  background: #07080c;   // ← was: default light surface
}
```

### 6b. Auth form panel inner background

No change needed — inherits dark body.

### 6c. Auth SCSS adjustments in `_auth.scss`

- **Google button:** update to dark glass style:
  ```scss
  background: rgba(255,255,255,0.06) !important;
  border-color: rgba(255,255,255,0.1) !important;
  color: rgba(255,255,255,0.75) !important;
  ```
- **OR divider line:** `rgba(255,255,255,0.08)`
- **Error banner:** already uses `var(--mat-sys-error-container)` — works with dark theme
- **Info banner (unverified email):** use `rgba(37,99,235,0.12)` background, `rgba(59,130,246,0.2)` border

---

## 8. Micro-Interactions

All transitions already partially exist. Ensure consistent `transition` declarations:

```scss
// Cards
transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s cubic-bezier(0.22,1,0.36,1);

// Nav items
transition: color 0.14s ease, background 0.14s ease;

// Buttons (primary)
transition: box-shadow 0.15s ease, opacity 0.15s ease, transform 0.15s ease;
```

Dialog open/close: use existing `scaleIn` keyframe (already defined in `_animations.scss`).

---

## 9. Files to Change

| File | Nature of change |
|---|---|
| `src/styles/_tokens.scss` | Color tokens + dialog surface + dark card hover tokens |
| `src/styles/_theme.scss` | `theme-type: dark`, body `color-scheme: dark`, form-field overrides, body background |
| `src/styles/_auth.scss` | Google button, divider, form panel background |
| `src/app/core/layout/protected-layout/protected-layout.component.scss` | Content BG, sidebar glow strength |
| `src/app/core/layout/public-layout/public-layout.component.scss` | Form panel background |
| `src/app/features/projects/pages/projects-list/projects-list.component.scss` | Card hover glow, filter tab active colors |

---

## 10. Out of Scope

- Custom icon set (Material Icons stay)
- Font change (Inter stays)
- New routes or components
- Light/dark toggle (dark only for now)
- Dashboard page (not yet in the codebase)
- Mobile/responsive changes

---

## 11. Success Criteria

- Content area is full dark — no white/grey surfaces visible
- Cards use glass surface with blue border glow on hover
- Dialogs/modals use backdrop blur
- Active nav item is clearly blue
- Status badges are readable on dark background
- Auth screen: brand panel unchanged, form panel is dark
- All interactive transitions feel smooth (no jank)
- Existing tests pass (visual only, no logic changes)
