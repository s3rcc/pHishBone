import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { MainLayout } from './components/layout/MainLayout';
import { SuspenseLoader } from './components/layout/SuspenseLoader';
import { LoginForm, RegisterForm } from './features/auth';

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('./routes/index'));
const ProfilePage = lazy(() => import('./features/profile/components/ProfilePage'));

// ─── Catalog / Workspace (lazy) ───────────────────────────────────────────────
const WorkspaceLayout = lazy(() =>
    import('./features/catalog-management').then((m) => ({ default: m.WorkspaceLayout })),
);
const SpeciesIndexPage = lazy(() =>
    import('./features/catalog-management').then((m) => ({ default: m.SpeciesIndexPage })),
);
const SpeciesCreatePage = lazy(() =>
    import('./features/catalog-management').then((m) => ({ default: m.SpeciesCreatePage })),
);
const TagsPage = lazy(() =>
    import('./features/catalog-management').then((m) => ({ default: m.TagsPage })),
);
const TypesPage = lazy(() =>
    import('./features/catalog-management').then((m) => ({ default: m.TypesPage })),
);

// ─── Root Route ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <MainLayout />
        </Suspense>
    ),
});

// ─── Public / Auth Routes ──────────────────────────────────────────────────────
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

// ─── Catalog Workspace Routes ─────────────────────────────────────────────────
const catalogRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/catalog',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <WorkspaceLayout />
        </Suspense>
    ),
});

const catalogSpeciesRoute = createRoute({
    getParentRoute: () => catalogRoute,
    path: '/species',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <SpeciesIndexPage />
        </Suspense>
    ),
});

const catalogSpeciesCreateRoute = createRoute({
    getParentRoute: () => catalogRoute,
    path: '/species/create',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <SpeciesCreatePage />
        </Suspense>
    ),
});

const catalogSpeciesEditRoute = createRoute({
    getParentRoute: () => catalogRoute,
    path: '/species/$id',
    component: function SpeciesEditRoute() {
        const { id } = catalogSpeciesEditRoute.useParams();
        const SpeciesEditPage = lazy(() =>
            import('./features/catalog-management').then((m) => ({ default: m.SpeciesEditPage })),
        );
        return (
            <Suspense fallback={<SuspenseLoader />}>
                <SpeciesEditPage speciesId={id} />
            </Suspense>
        );
    },
});

const catalogTagsRoute = createRoute({
    getParentRoute: () => catalogRoute,
    path: '/tags',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <TagsPage />
        </Suspense>
    ),
});

const catalogTypesRoute = createRoute({
    getParentRoute: () => catalogRoute,
    path: '/types',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <TypesPage />
        </Suspense>
    ),
});

// ─── Route Tree & Router ──────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    profileRoute,
    catalogRoute.addChildren([
        catalogSpeciesRoute,
        catalogSpeciesCreateRoute,
        catalogSpeciesEditRoute,
        catalogTagsRoute,
        catalogTypesRoute,
    ]),
]);

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
