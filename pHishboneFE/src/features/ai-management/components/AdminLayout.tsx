import React from 'react';
import { Outlet } from '@tanstack/react-router';
import Box from '@mui/material/Box';
import { AdminSidebar } from './AdminSidebar';
import { RoleGuard } from '../../catalog-management/components/RoleGuard';

/**
 * AdminLayout – wraps all /admin/* routes with a persistent collapsible sidebar.
 * Access restricted to Admin role.
 */
export const AdminLayout: React.FC = () => {
    return (
        <RoleGuard allowedRoles={['Admin']}>
            <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
                <AdminSidebar />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'background.default',
                        overflowY: 'auto',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </RoleGuard>
    );
};

export default AdminLayout;
