import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AUTH_ME_KEY, authApi } from '../../auth';
import GuestTankBuilderWorkspace from './GuestTankBuilderWorkspace';
import UserTankBuilderWorkspace from './UserTankBuilderWorkspace';

export function TankBuilderDashboard(): ReactElement {
    const { data: currentUser } = useQuery({
        queryKey: AUTH_ME_KEY,
        queryFn: authApi.getMe,
        retry: false,
    });

    return currentUser ? <UserTankBuilderWorkspace /> : <GuestTankBuilderWorkspace />;
}

export default TankBuilderDashboard;
