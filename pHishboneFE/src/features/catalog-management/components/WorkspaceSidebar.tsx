import React, { useCallback, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import BiotechIcon from '@mui/icons-material/Biotech';
import CategoryIcon from '@mui/icons-material/Category';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LabelIcon from '@mui/icons-material/Label';
import MenuBookIcon from '@mui/icons-material/MenuBook';

/** Sidebar width constants */
const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 56;

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [collapsed, setCollapsed] = useState(isMobile);

    // Auto-collapse on mobile
    React.useEffect(() => {
        setCollapsed(isMobile);
    }, [isMobile]);

    const handleNav = useCallback(
        (path: string) => {
            void navigate({ to: path });
        },
        [navigate],
    );

    const handleToggle = useCallback(() => {
        setCollapsed((prev) => !prev);
    }, []);

    const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    return (
        <Box
            component="nav"
            sx={{
                width: sidebarWidth,
                flexShrink: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s ease-in-out',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: collapsed ? 0 : 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    minHeight: 48,
                }}
            >
                {!collapsed && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MenuBookIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography
                            variant="caption"
                            fontWeight={700}
                            letterSpacing={0.8}
                            color="text.secondary"
                            sx={{ textTransform: 'uppercase', whiteSpace: 'nowrap' }}
                        >
                            {t('Catalog.managerTitle')}
                        </Typography>
                    </Box>
                )}
                <Tooltip title={collapsed ? t('AiManagement.expandSidebar') : t('AiManagement.collapseSidebar')}>
                    <IconButton size="small" onClick={handleToggle} sx={{ color: 'text.secondary' }}>
                        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider />

            <List dense sx={{ pt: 1 }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = currentPath.startsWith(item.path);
                    const button = (
                        <ListItemButton
                            onClick={() => handleNav(item.path)}
                            selected={isActive}
                            sx={{
                                mx: collapsed ? 0.5 : 1,
                                borderRadius: '4px',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                px: collapsed ? 1 : 2,
                                '&.Mui-selected': {
                                    bgcolor: 'action.selected',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                                    '& .MuiListItemText-primary': { fontWeight: 600 },
                                },
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: collapsed ? 'auto' : 32,
                                    color: 'text.secondary',
                                    justifyContent: 'center',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText
                                    primary={t(item.labelKey)}
                                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                                />
                            )}
                        </ListItemButton>
                    );

                    return (
                        <ListItem key={item.path} disablePadding>
                            {collapsed ? (
                                <Tooltip title={t(item.labelKey)} placement="right">
                                    {button}
                                </Tooltip>
                            ) : (
                                button
                            )}
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default WorkspaceSidebar;
