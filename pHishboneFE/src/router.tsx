import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { MainLayout } from './components/layout/MainLayout';
import { SuspenseLoader } from './components/layout/SuspenseLoader';
import { LoginForm, RegisterForm } from './features/auth';

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('./routes/index'));
const ProfilePage = lazy(() => import('./features/profile/components/ProfilePage'));

// ─── Error Pages (lazy) ───────────────────────────────────────────────────────
const NotFoundPage = lazy(() => import('./routes/errors/404'));
const UnauthorizedPage = lazy(() => import('./routes/errors/401'));
const ServerErrorPage = lazy(() => import('./routes/errors/500'));

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
const CompatibilityRulesPage = lazy(() =>
    import('./features/catalog-management').then((m) => ({ default: m.CompatibilityRulesPage })),
);

// ─── Public Catalog (lazy) ────────────────────────────────────────────────────
const CatalogPage = lazy(() =>
    import('./features/public-catalog').then((m) => ({ default: m.CatalogPage })),
);
const SpeciesDetailPage = lazy(() =>
    import('./features/public-catalog').then((m) => ({ default: m.SpeciesDetailPage })),
);

// ─── Tank Builder (lazy) ──────────────────────────────────────────────────────
const TankBuilderDashboard = lazy(() =>
    import('./features/tank-builder').then((m) => ({ default: m.TankBuilderDashboard })),
);

// ─── Admin / AI Management (lazy) ────────────────────────────────────────────
const AdminLayout = lazy(() =>
    import('./features/ai-management').then((m) => ({ default: m.AdminLayout })),
);
const AiModelsPage = lazy(() =>
    import('./features/ai-management').then((m) => ({ default: m.AiModelsPage })),
);
const AiPromptsPage = lazy(() =>
    import('./features/ai-management').then((m) => ({ default: m.AiPromptsPage })),
);
const AdminUsersPage = lazy(() =>
    import('./features/ai-management').then((m) => ({ default: m.AdminUsersPage })),
);

// ─── Root Route ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <MainLayout />
        </Suspense>
    ),
    notFoundComponent: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <NotFoundPage />
        </Suspense>
    ),
    errorComponent: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <ServerErrorPage />
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

const catalogCompatibilityRoute = createRoute({
    getParentRoute: () => catalogRoute,
    path: '/compatibility',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <CompatibilityRulesPage />
        </Suspense>
    ),
});

// ─── Public Catalog Routes ────────────────────────────────────────────────────
const exploreRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/explore',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <CatalogPage />
        </Suspense>
    ),
});

const exploreDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/explore/$slug',
    component: function ExploreDetailRoute() {
        const { slug } = exploreDetailRoute.useParams();
        return (
            <Suspense fallback={<SuspenseLoader />}>
                <SpeciesDetailPage slug={slug} />
            </Suspense>
        );
    },
});

const tankBuilderRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tank-builder',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <TankBuilderDashboard />
        </Suspense>
    ),
});

// ─── Admin Workspace Routes ──────────────────────────────────────────────────
const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <AdminLayout />
        </Suspense>
    ),
});

const adminModelsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/ai-models',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <AiModelsPage />
        </Suspense>
    ),
});

const adminUsersRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/users',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <AdminUsersPage />
        </Suspense>
    ),
});

const adminPromptsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/ai-prompts',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <AiPromptsPage />
        </Suspense>
    ),
});

const unauthorizedRoute = createRoute({

    getParentRoute: () => rootRoute,
    path: '/401',
    component: () => (
        <Suspense fallback={<SuspenseLoader />}>
            <UnauthorizedPage />
        </Suspense>
    ),
});

// ─── Route Tree & Router ──────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    profileRoute,
    unauthorizedRoute,
    exploreRoute,
    exploreDetailRoute,
    tankBuilderRoute,
    catalogRoute.addChildren([
        catalogSpeciesRoute,
        catalogSpeciesCreateRoute,
        catalogSpeciesEditRoute,
        catalogTagsRoute,
        catalogTypesRoute,
        catalogCompatibilityRoute,
    ]),
    adminRoute.addChildren([
        adminUsersRoute,
        adminModelsRoute,
        adminPromptsRoute,
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
