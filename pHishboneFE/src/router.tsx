import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { MainLayout } from './components/layout/MainLayout';
import { SuspenseLoader } from './components/layout/SuspenseLoader';
import { LoginForm, RegisterForm } from './features/auth';

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('./routes/index'));
const ProfilePage = lazy(() => import('./features/profile/components/ProfilePage'));

// ─── Root Route ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <MainLayout />
        </Suspense>
    ),
});

// ─── Child Routes ─────────────────────────────────────────────────────────────
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <HomePage />
        </Suspense>
    ),
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginForm,
});

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: RegisterForm,
});

const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <ProfilePage />
        </Suspense>
    ),
});

// ─── Route Tree & Router ──────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([indexRoute, loginRoute, registerRoute, profileRoute]);

export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});

// Register router for full type inference across the app
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
