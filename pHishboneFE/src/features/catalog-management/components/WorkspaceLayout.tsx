import React from 'react';
import { Outlet } from '@tanstack/react-router';
import Box from '@mui/material/Box';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { RoleGuard } from './RoleGuard';

/**
 * WorkspaceLayout – wraps all /catalog/* routes with a persistent sidebar.
 */
export const WorkspaceLayout: React.FC = () => {
    return (
        <RoleGuard allowedRoles={['KnowledgeManager', 'Admin']}>
            <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
                <WorkspaceSidebar />
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

export default WorkspaceLayout;
