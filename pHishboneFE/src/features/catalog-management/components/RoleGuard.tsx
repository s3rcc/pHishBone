import React from 'react';

interface RoleGuardProps {
    /** Roles that are permitted to see the children. */
    allowedRoles: ('KnowledgeManager' | 'SuperAdmin')[];
    children: React.ReactNode;
}

/**
 * RoleGuard – access control wrapper for KnowledgeManager workspace.
 * FUTURE: Integrate with the auth context to check the current user's role
 * and show an "Access Denied" screen for unauthorized users.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ children }) => {
    // TODO: read user role from auth context and compare against allowedRoles
    return <>{children}</>;
};

export default RoleGuard;
