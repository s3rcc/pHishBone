import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { SuspenseLoader } from '../../../components/layout/SuspenseLoader';
import { UnauthorizedPage } from '../../../routes/errors/401';
import { authApi } from '../../auth/api/authApi';
import { AUTH_ME_KEY } from '../../auth/hooks/useAuth';
import type { AppRole } from '../../auth/types';

interface RoleGuardProps {
    /** Roles that are permitted to see the children. */
    allowedRoles: AppRole[];
    children: React.ReactNode;
}

/**
 * RoleGuard – access control wrapper for authenticated, role-protected areas.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
    const { data: user, isPending, error } = useQuery({
        queryKey: AUTH_ME_KEY,
        queryFn: authApi.getMe,
        retry: false,
    });

    if (isPending) {
        return <SuspenseLoader />;
    }

    const statusCode = (error as AxiosError | null)?.response?.status;
    if (statusCode === 401 || statusCode === 403 || !user) {
        return <UnauthorizedPage />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <UnauthorizedPage />;
    }

    return <>{children}</>;
};

export default RoleGuard;
