import React, { useCallback } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import BiotechIcon from '@mui/icons-material/Biotech';
import LabelIcon from '@mui/icons-material/Label';
import CategoryIcon from '@mui/icons-material/Category';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface NavItem {
    labelKey: string;
    path: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    { labelKey: 'Catalog.nav.species', path: '/catalog/species', icon: <BiotechIcon fontSize="small" /> },
    { labelKey: 'Catalog.nav.types', path: '/catalog/types', icon: <CategoryIcon fontSize="small" /> },
    { labelKey: 'Catalog.nav.tags', path: '/catalog/tags', icon: <LabelIcon fontSize="small" /> },
    { labelKey: 'Catalog.nav.rules', path: '/catalog/compatibility', icon: <CompareArrowsIcon fontSize="small" /> },
];

export const WorkspaceSidebar: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;

    const handleNav = useCallback(
        (path: string) => {
            void navigate({ to: path });
        },
        [navigate],
    );

    return (
        <Box
            component="nav"
            sx={{
                width: 220,
                flexShrink: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography
                    variant="caption"
                    fontWeight={700}
                    letterSpacing={0.8}
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase' }}
                >
                    {t('Catalog.managerTitle')}
                </Typography>
            </Box>

            <Divider />

            <List dense sx={{ pt: 1 }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = currentPath.startsWith(item.path);
                    return (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                onClick={() => handleNav(item.path)}
                                selected={isActive}
                                sx={{
                                    mx: 1,
                                    borderRadius: '4px',
                                    '&.Mui-selected': {
                                        bgcolor: 'action.selected',
                                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                                        '& .MuiListItemText-primary': { fontWeight: 600 },
                                    },
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={t(item.labelKey)}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default WorkspaceSidebar;
