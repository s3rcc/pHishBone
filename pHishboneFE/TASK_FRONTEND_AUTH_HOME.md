# TASK: IMPLEMENT HOMEPAGE & AUTHENTICATION (FRONTEND)

## 1. Context & Architecture Doctrine
* **Project:** pHishbone (Aquarium Management Expert System).
* **Tech Stack:** React, TypeScript, TanStack Router, MUI v7, TanStack Query (React Query).
* **Architectural Standard:** Strict adherence to `frontend-dev-guidelines` (Suspense-first, feature-based organization, lazy loading, strict TS).
* **Backend:** Custom .NET REST API (Do NOT use Supabase Auth. Use the API endpoints defined below).

## 2. Feature-Based Folder Structure to Scaffold

```text
src/
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   └── authApi.ts          # Axios/Fetch calls for Auth endpoints
│   │   ├── components/
│   │   │   ├── LoginForm.tsx       # MUI Form, lazy-loaded if needed
│   │   │   └── RegisterForm.tsx    
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # useSuspenseQuery for /me, useMutation for login
│   │   │   └── useLogout.ts
│   │   ├── types/
│   │   │   └── index.ts            # DTOs mapped from Swagger
│   │   └── index.ts                # Public exports for the auth feature
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx          # Shared layout with MUI AppBar
│   │   └── SuspenseLoader.tsx      # Global fallback for Suspense boundaries
├── routes/
│   ├── index.tsx                   # Homepage Route
│   ├── login.tsx                   # Login Route
│   └── register.tsx                # Register Route
```

## 3. API Contract & Types (From Swagger)

```typescript
export interface ApiResponse<T> {
  statusCode: number;
  errorCode: string | null;
  message: string;
  data: T | null;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

export interface LoginRequestDto {
  email?: string;
  password?: string;
}

export interface RegisterRequestDto {
  username?: string;
  email?: string;
  password?: string;
}
```

## 4. Authentication Endpoints

- `POST /api/auth/login` → `ApiResponse<LoginResponseDto>`
- `POST /api/auth/register` → `ApiResponse<LoginResponseDto>`
- `GET /api/auth/me` → `ApiResponse<UserDto>` (via `useSuspenseQuery`)
- `POST /api/auth/logout`

## 5. UI Requirements (MUI v7)

- Login/Register: centered `Paper`, `useMutation`, MUI `Snackbar` for feedback, redirect `/` on success
- Homepage: Navbar shows user or login/register buttons via `useSuspenseQuery`; Hero section with "Design Your Dream Aquarium. Safely."

## 6. Checklist

- [ ] No `isLoading` flags for `/me` query – use `<Suspense>`
- [ ] MUI v7 Grid syntax (`size={{ xs: 12 }}`)
- [ ] All routing via TanStack Router
- [ ] Feature-based folder structure
- [ ] All handlers wrapped in `useCallback`
