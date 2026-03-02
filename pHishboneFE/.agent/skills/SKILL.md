name: frontend-dev-guidelines

description: "Opinionated frontend development standards for modern React + TypeScript applications. Covers Suspense-first data fetching, lazy loading, feature-based architecture, MUI v7 styling, TanStack Router..."

risk: unknown

source: community

---





# Frontend Development Guidelines



**(React · TypeScript · Suspense-First · Production-Grade)**



You are a **senior frontend engineer** operating under strict architectural and performance standards.



Your goal is to build **scalable, predictable, and maintainable React applications** using:



* Suspense-first data fetching

* Feature-based code organization

* Strict TypeScript discipline

* Performance-safe defaults



This skill defines **how frontend code must be written**, not merely how it *can* be written.



---



## 1. Frontend Feasibility & Complexity Index (FFCI)



Before implementing a component, page, or feature, assess feasibility.



### FFCI Dimensions (1–5)



| Dimension             | Question                                                         |

| --------------------- | ---------------------------------------------------------------- |

| **Architectural Fit** | Does this align with feature-based structure and Suspense model? |

| **Complexity Load**   | How complex is state, data, and interaction logic?               |

| **Performance Risk**  | Does it introduce rendering, bundle, or CLS risk?                |

| **Reusability**       | Can this be reused without modification?                         |

| **Maintenance Cost**  | How hard will this be to reason about in 6 months?               |



### Score Formula



```

FFCI = (Architectural Fit + Reusability + Performance) − (Complexity + Maintenance Cost)

```



**Range:** `-5 → +15`



### Interpretation



| FFCI      | Meaning    | Action            |

| --------- | ---------- | ----------------- |

| **10–15** | Excellent  | Proceed           |

| **6–9**   | Acceptable | Proceed with care |

| **3–5**   | Risky      | Simplify or split |

| **≤ 2**   | Poor       | Redesign          |



---



## 2. Core Architectural Doctrine (Non-Negotiable)



### 1. Suspense Is the Default



* `useSuspenseQuery` is the **primary** data-fetching hook

* No `isLoading` conditionals

* No early-return spinners



### 2. Lazy Load Anything Heavy



* Routes

* Feature entry components

* Data grids, charts, editors

* Large dialogs or modals



### 3. Feature-Based Organization



* Domain logic lives in `features/`

* Reusable primitives live in `components/`

* Cross-feature coupling is forbidden



### 4. TypeScript Is Strict



* No `any`

* Explicit return types

* `import type` always

* Types are first-class design artifacts



---



## 3. When to Use This Skill



Use **frontend-dev-guidelines** when:



* Creating components or pages

* Adding new features

* Fetching or mutating data

* Setting up routing

* Styling with MUI

* Addressing performance issues

* Reviewing or refactoring frontend code



---



## 4. Quick Start Checklists



### New Component Checklist



* [ ] `React.FC<Props>` with explicit props interface

* [ ] Lazy loaded if non-trivial

* [ ] Wrapped in `<SuspenseLoader>`

* [ ] Uses `useSuspenseQuery` for data

* [ ] No early returns

* [ ] Handlers wrapped in `useCallback`

* [ ] Styles inline if <100 lines

* [ ] Default export at bottom

* [ ] Uses `useMuiSnackbar` for feedback



---



### New Feature Checklist



* [ ] Create `features/{feature-name}/`

* [ ] Subdirs: `api/`, `components/`, `hooks/`, `helpers/`, `types/`

* [ ] API layer isolated in `api/`

* [ ] Public exports via `index.ts`

* [ ] Feature entry lazy loaded

* [ ] Suspense boundary at feature level

* [ ] Route defined under `routes/`



---



## 5. Import Aliases (Required)



| Alias         | Path             |

| ------------- | ---------------- |

| `@/`          | `src/`           |

| `~types`      | `src/types`      |

| `~components` | `src/components` |

| `~features`   | `src/features`   |



Aliases must be used consistently. Relative imports beyond one level are discouraged.



---



## 6. Component Standards



### Required Structure Order



1. Types / Props

2. Hooks

3. Derived values (`useMemo`)

4. Handlers (`useCallback`)

5. Render

6. Default export



### Lazy Loading Pattern



```ts

const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

```



Always wrapped in `<SuspenseLoader>`.



---



## 7. Data Fetching Doctrine



### Primary Pattern



* `useSuspenseQuery`

* Cache-first

* Typed responses



### Forbidden Patterns



❌ `isLoading`

❌ manual spinners

❌ fetch logic inside components

❌ API calls without feature API layer



### API Layer Rules



* One API file per feature

* No inline axios calls

* No `/api/` prefix in routes



---



## 8. Routing Standards (TanStack Router)



* Folder-based routing only

* Lazy load route components

* Breadcrumb metadata via loaders



```ts

export const Route = createFileRoute('/my-route/')({

  component: MyPage,

  loader: () => ({ crumb: 'My Route' }),

});

```



---



## 9. Styling Standards (MUI v7)



### Inline vs Separate



* `<100 lines`: inline `sx`

* `>100 lines`: `{Component}.styles.ts`



### Grid Syntax (v7 Only)



```tsx

<Grid size={{ xs: 12, md: 6 }} /> // ✅

<Grid xs={12} md={6} />          // ❌

```



Theme access must always be type-safe.



---



## 10. Loading & Error Handling



### Absolute Rule



❌ Never return early loaders

✅ Always rely on Suspense boundaries



### User Feedback



* `useMuiSnackbar` only

* No third-party toast libraries



---



## 11. Performance Defaults



* `useMemo` for expensive derivations

* `useCallback` for passed handlers

* `React.memo` for heavy pure components

* Debounce search (300–500ms)

* Cleanup effects to avoid leaks



Performance regressions are bugs.



---



## 12. TypeScript Standards



* Strict mode enabled

* No implicit `any`

* Explicit return types

* JSDoc on public interfaces

* Types colocated with feature



---



## 13. Canonical File Structure



```

src/

  features/

    my-feature/

      api/

      components/

      hooks/

      helpers/

      types/

      index.ts



  components/

    SuspenseLoader/

    CustomAppBar/



  routes/

    my-route/

      index.tsx

```



---



## 14. Canonical Component Template



```ts

import React, { useState, useCallback } from 'react';

import { Box, Paper } from '@mui/material';

import { useSuspenseQuery } from '@tanstack/react-query';

import { featureApi } from '../api/featureApi';

import type { FeatureData } from '~types/feature';



interface MyComponentProps {

  id: number;

  onAction?: () => void;

}



export const MyComponent: React.FC<MyComponentProps> = ({ id, onAction }) => {

  const [state, setState] = useState('');



  const { data } = useSuspenseQuery<FeatureData>({

    queryKey: ['feature', id],

    queryFn: () => featureApi.getFeature(id),

  });



  const handleAction = useCallback(() => {

    setState('updated');

    onAction?.();

  }, [onAction]);



  return (

    <Box sx={{ p: 2 }}>

      <Paper sx={{ p: 3 }}>

        {/* Content */}

      </Paper>

    </Box>

  );

};



export default MyComponent;

```



---



## 15. Anti-Patterns (Immediate Rejection)



❌ Early loading returns

❌ Feature logic in `components/`

❌ Shared state via prop drilling instead of hooks

❌ Inline API calls

❌ Untyped responses

❌ Multiple responsibilities in one component



---



## 16. Integration With Other Skills



* **frontend-design** → Visual systems & aesthetics

* **page-cro** → Layout hierarchy & conversion logic

* **analytics-tracking** → Event instrumentation

* **backend-dev-guidelines** → API contract alignment

* **error-tracking** → Runtime observability



---



## 17. Operator Validation Checklist



Before finalizing code:



* [ ] FFCI ≥ 6

* [ ] Suspense used correctly

* [ ] Feature boundaries respected

* [ ] No early returns

* [ ] Types explicit and correct

* [ ] Lazy loading applied

* [ ] Performance safe



---



## 18. Skill Status



**Status:** Stable, opinionated, and enforceable

**Intended Use:** Production React codebases with long-term maintenance horizons





## When to Use

This skill is applicable to execute the workflow or actions described in the overview.

I already have the skill file here, so just have the insruction and the api endpoint + request and reponse for those pages

---



## 19. Multi-Language (i18n) Standards



### Library & Stack



* **Library:** `i18next` + `react-i18next` + `i18next-browser-languagedetector`

* **NOT** `next-intl` — this is a Vite project, not Next.js

* Supported locales: `en` (English) and `vi` (Vietnamese)



### File Structure



```

src/

  i18n/

    index.ts           # i18next initialization (import this in main.tsx FIRST)

    i18n.d.ts          # TypeScript type augmentation for t() autocomplete

    locales/

      en.json          # English dictionary — source of truth

      vi.json          # Vietnamese dictionary — must mirror en.json exactly

```



### Dictionary Structure (Nested by Feature)



Translations are grouped by feature namespace:

```json

{

  "Common":    { "save": "...", "cancel": "...", "loading": "..." },

  "Navigation": { "login": "...", "register": "...", "logout": "...", ... },

  "Home":      { "badge": "...", "headline": "...", "subtitle": "...", ... },

  "Auth": {

    "Login":    { "title": "...", "emailLabel": "...", "submitButton": "...", ... },

    "Register": { "title": "...", "usernameLabel": "...", ... }

  },

  "Profile": {

    "Avatar":   { "sectionTitle": "...", "changePhoto": "...", ... },

    "Username": { "sectionTitle": "...", "fieldLabel": "...", ... },

    "Email":    { "sectionTitle": "...", "fieldLabel": "...", ... }

  }

}

```



### Locale Persistence



* Language is stored in `localStorage` under key `phishbone-language`

* Default locale: `en`

* Fallback locale: `en`

* Browser language is used when no `localStorage` value exists



### Hook Usage



```ts

// In any component (Server or Client)

const { t } = useTranslation();

// Usage:

t('Navigation.login')       // ✅ flat key

t('Auth.Login.submitButton') // ✅ nested key — TypeScript autocomplete works

```



* Always destructure `{ t }` from `useTranslation()` — never use `i18n.t()` directly in JSX

* `useTranslation()` must be called at the **top of the component**, alongside other hooks



### LanguageSwitcher Component



* Location: `src/components/ui/LanguageSwitcher.tsx`

* Type: `React.FC` (explicit, no props)

* UI: MUI `ToggleButtonGroup` with `EN` and `VI` values

* Language change handler **must** be wrapped in `useCallback`

* Must be placed in `MainLayout` Navbar, between the logo and theme toggle



### TypeScript Requirements



* `src/i18n/i18n.d.ts` must declare `CustomTypeOptions` mapping `'translation'` to `typeof en`

* This gives full **autocomplete and compile-time safety** on all `t('key')` calls

* Adding keys to `en.json` automatically enables type checking — no manual type updates needed



### Rules (Non-Negotiable)



❌ No hardcoded user-facing strings in any component — use `t('Namespace.key')`

❌ Do not use inline fallback strings like `t('key') || 'fallback'` — put the fallback in `en.json`

❌ Do not call `i18n.changeLanguage()` outside of `LanguageSwitcher`

❌ Do not add keys to `vi.json` without a matching key in `en.json`

✅ Add new feature strings to **both** `en.json` and `vi.json` at the same time

✅ Group keys under the feature name (e.g., `Profile.Avatar.*`, `Auth.Login.*`)

✅ Use `Common.*` for strings shared across multiple features (Save, Cancel, etc.)



### Adding i18n to a New Feature



1. Add keys to `src/i18n/locales/en.json` under `"FeatureName": { ... }`

2. Add matching Vietnamese translations to `src/i18n/locales/vi.json`

3. In each component: `const { t } = useTranslation();`

4. Replace every hardcoded string with `t('FeatureName.keyName')`

5. Run `npx tsc --noEmit` to confirm zero type errors