import React from 'react';
import { ProfileSettingsSection } from './ProfileSettingsSection';
import { ProfileShell } from './ProfileShell';

export const ProfilePage: React.FC = () => (
    <ProfileShell>
        <ProfileSettingsSection />
    </ProfileShell>
);

export default ProfilePage;
