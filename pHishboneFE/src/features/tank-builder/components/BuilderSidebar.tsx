import { Suspense, useCallback, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { DragEvent, ReactElement } from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Skeleton,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../public-catalog/hooks/useDebounce';
import type { SpeciesDto, SwimLevel } from '../../catalog-management/types';
import { tankApi } from '../api/tankApi';
import type { TankListItemDto, TankMode, TankSpeciesDraft, TankStatus } from '../types';

interface BuilderSidebarProps {
    mode: TankMode;
    inventory: TankSpeciesDraft[];
    selectedSpeciesId: string | null;
    onAddSpecies: (species: SpeciesDto) => Promise<void>;
    onIncrementSpecies: (speciesId: string) => void;
    onDecrementSpecies: (speciesId: string) => void;
    onRemoveSpecies: (speciesId: string) => void;
    onSelectSpecies: (speciesId: string | null) => void;
    onClearInventory: () => void;
    tankName?: string;
    tankOptions?: TankListItemDto[];
    selectedTankId?: string | null;
    onTankNameChange?: (name: string) => void;
    onSelectTank?: (tankId: string) => void;
    onCreateTank?: () => Promise<void>;
    onDeleteTank?: () => Promise<void>;
    isTankMutating?: boolean;
}

function getSwimLevelTranslationKey(swimLevel: SwimLevel): string {
    return `Catalog.swimLevel.${swimLevel}`;
}

function getTankStatusTranslationKey(status: TankStatus): string {
    switch (status) {
        case 1:
            return 'TankBuilder.tankStatusActive';
        case 2:
            return 'TankBuilder.tankStatusArchived';
        default:
            return 'TankBuilder.tankStatusDraft';
    }
}

function SearchResultSkeleton(): ReactElement {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {Array.from({ length: 4 }, (_, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.04)',
                    }}
                >
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

interface SpeciesSearchResultsProps {
    searchTerm: string;
    onAddSpecies: (species: SpeciesDto) => Promise<void>;
}

function SpeciesSearchResults({ searchTerm, onAddSpecies }: SpeciesSearchResultsProps): ReactElement {
    const { t } = useTranslation();
    const { data } = useSuspenseQuery({
        queryKey: ['tank-builder', 'species-search', searchTerm],
        queryFn: () => tankApi.searchSpecies(searchTerm),
    });

    const handleDragStart = useCallback((event: DragEvent<HTMLDivElement>, species: SpeciesDto) => {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('application/phishbone-species', JSON.stringify(species));
    }, []);

    if (data.length === 0) {
        return (
            <Box
                sx={{
                    px: 2,
                    py: 4,
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                    color: 'text.secondary',
                }}
            >
                <Typography variant="body2">{t('TankBuilder.noResults')}</Typography>
            </Box>
        );
    }

    return (
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {data.map((species) => (
                <Paper
                    key={species.id}
                    component="div"
                    draggable
                    onDragStart={(event: DragEvent<HTMLDivElement>) => handleDragStart(event, species)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'grab',
                        transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            borderColor: 'primary.main',
                            boxShadow: '0 14px 28px rgba(0, 188, 212, 0.14)',
                        },
                    }}
                >
                    <ListItemAvatar sx={{ minWidth: 'auto' }}>
                        <Avatar src={species.thumbnailUrl} alt={species.commonName}>
                            {species.commonName.charAt(0)}
                        </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                        primary={species.commonName}
                        secondary={species.scientificName}
                        primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                    />

                    <Tooltip title={t('TankBuilder.addSpecies')}>
                        <IconButton type="button" color="primary" onClick={() => onAddSpecies(species)}>
                            <AddRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Paper>
            ))}
        </List>
    );
}

interface TankManagementTabProps {
    mode: TankMode;
    tankName?: string;
    tankOptions: TankListItemDto[];
    selectedTankId?: string | null;
    onTankNameChange?: (name: string) => void;
    onSelectTank?: (tankId: string) => void;
    onCreateTank?: () => Promise<void>;
    onDeleteTank?: () => Promise<void>;
    isTankMutating?: boolean;
}

function TankManagementTab({
    mode,
    tankName,
    tankOptions,
    selectedTankId,
    onTankNameChange,
    onSelectTank,
    onCreateTank,
    onDeleteTank,
    isTankMutating = false,
}: TankManagementTabProps): ReactElement {
    const { t } = useTranslation();

    if (mode === 'guest') {
        return (
            <Box
                sx={{
                    px: 2,
                    py: 5,
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                    color: 'text.secondary',
                }}
            >
                <Typography variant="body2">{t('TankBuilder.guestTankTabHint')}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                    {t('TankBuilder.myTanksTitle')}
                </Typography>
                <Button
                    type="button"
                    variant="text"
                    color="primary"
                    onClick={() => void onCreateTank?.()}
                    startIcon={<AddRoundedIcon />}
                >
                    {t('TankBuilder.createTank')}
                </Button>
            </Box>

            {selectedTankId ? (
                <TextField
                    fullWidth
                    value={tankName ?? ''}
                    onChange={(event) => onTankNameChange?.(event.target.value)}
                    label={t('TankBuilder.tankNameLabel')}
                    sx={{ mb: 2 }}
                />
            ) : null}

            {tankOptions.length === 0 ? (
                <Box
                    sx={{
                        px: 2,
                        py: 4,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                        {t('TankBuilder.noUserTanks')}
                    </Typography>
                    <Button type="button" variant="contained" onClick={() => void onCreateTank?.()}>
                        {t('TankBuilder.createFirstTank')}
                    </Button>
                </Box>
            ) : (
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 1.5 }}>
                    {tankOptions.map((tank) => (
                        <Paper
                            key={tank.id}
                            onClick={() => onSelectTank?.(tank.id)}
                            sx={{
                                px: 1.5,
                                py: 1.25,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: selectedTankId === tank.id ? 'primary.main' : 'divider',
                                backgroundColor:
                                    selectedTankId === tank.id ? 'rgba(0,188,212,0.10)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={700} noWrap>
                                        {tank.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('TankBuilder.tankListMeta', {
                                            count: tank.itemCount,
                                            volume: tank.waterVolume,
                                        })}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={t(getTankStatusTranslationKey(tank.status))}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Paper>
                    ))}
                </List>
            )}

            {selectedTankId ? (
                <Button
                    type="button"
                    fullWidth
                    color="error"
                    variant="outlined"
                    onClick={() => void onDeleteTank?.()}
                    startIcon={<DeleteOutlineRoundedIcon />}
                    sx={{ mb: 1 }}
                >
                    {t('TankBuilder.deleteTank')}
                </Button>
            ) : null}

            <Typography variant="caption" color="text.secondary">
                {isTankMutating ? t('TankBuilder.tankSyncing') : t('TankBuilder.tankAutosave')}
            </Typography>
        </Box>
    );
}

export function BuilderSidebar({
    mode,
    inventory,
    selectedSpeciesId,
    onAddSpecies,
    onIncrementSpecies,
    onDecrementSpecies,
    onRemoveSpecies,
    onSelectSpecies,
    onClearInventory,
    tankName,
    tankOptions = [],
    selectedTankId,
    onTankNameChange,
    onSelectTank,
    onCreateTank,
    onDeleteTank,
    isTankMutating = false,
}: BuilderSidebarProps): ReactElement {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 350);

    return (
        <Paper
            sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 4,
                border: '1px solid rgba(0, 188, 212, 0.15)',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(180deg, rgba(8, 24, 40, 0.92), rgba(14, 39, 61, 0.92))'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(239,250,252,0.98))',
                backdropFilter: 'blur(12px)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>
                        {t('TankBuilder.sidebarTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t(mode === 'user' ? 'TankBuilder.sidebarSubtitleUser' : 'TankBuilder.sidebarSubtitleGuest')}
                    </Typography>
                </Box>
                <Chip
                    icon={<WaterDropRoundedIcon />}
                    label={t(mode === 'user' ? 'TankBuilder.myTankBadge' : 'TankBuilder.guestBadge')}
                    color="primary"
                    variant="outlined"
                    size="small"
                />
            </Box>

            <Tabs
                value={activeTab}
                onChange={(_event, value) => setActiveTab(value)}
                variant="fullWidth"
                sx={{ mb: 2 }}
            >
                <Tab label={t('TankBuilder.speciesTab')} />
                <Tab label={t('TankBuilder.tankTab')} />
                <Tab label={t('TankBuilder.filterTab')} />
                <Tab label={t('TankBuilder.productTab')} />
            </Tabs>

            {activeTab === 0 ? (
                <>
                    <TextField
                        fullWidth
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder={t('TankBuilder.searchPlaceholder')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 1.5 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        {t('TankBuilder.dragHint')}
                    </Typography>

                    <Suspense fallback={<SearchResultSkeleton />}>
                        <SpeciesSearchResults searchTerm={debouncedSearch} onAddSpecies={onAddSpecies} />
                    </Suspense>
                </>
            ) : activeTab === 1 ? (
                <TankManagementTab
                    mode={mode}
                    tankName={tankName}
                    tankOptions={tankOptions}
                    selectedTankId={selectedTankId}
                    onTankNameChange={onTankNameChange}
                    onSelectTank={onSelectTank}
                    onCreateTank={onCreateTank}
                    onDeleteTank={onDeleteTank}
                    isTankMutating={isTankMutating}
                />
            ) : (
                <Box
                    sx={{
                        px: 2,
                        py: 5,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center',
                        color: 'text.secondary',
                        mb: 2,
                    }}
                >
                    <Typography variant="body2">{t('TankBuilder.equipmentComingSoon')}</Typography>
                </Box>
            )}

            <Divider sx={{ my: 2.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                    {t('TankBuilder.speciesSection')}
                </Typography>
                <Button type="button" variant="text" color="inherit" disabled={inventory.length === 0} onClick={onClearInventory}>
                    {t(mode === 'user' ? 'TankBuilder.clearTank' : 'TankBuilder.clearDraft')}
                </Button>
            </Box>

            {inventory.length === 0 ? (
                <Box
                    sx={{
                        px: 2,
                        py: 4,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography variant="body2">{t('TankBuilder.emptyTank')}</Typography>
                </Box>
            ) : (
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {inventory.map((item) => (
                        <ListItem
                            key={item.speciesId}
                            onClick={() => onSelectSpecies(item.speciesId)}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr auto',
                                gap: 1.5,
                                alignItems: 'center',
                                px: 1.5,
                                py: 1.25,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: selectedSpeciesId === item.speciesId ? 'primary.main' : 'divider',
                                backgroundColor:
                                    selectedSpeciesId === item.speciesId ? 'rgba(0,188,212,0.10)' : 'transparent',
                                transition: 'all 0.18s ease',
                                cursor: 'pointer',
                            }}
                        >
                            <Avatar src={item.thumbnailUrl} alt={item.commonName}>
                                {item.commonName.charAt(0)}
                            </Avatar>

                            <Box>
                                <Typography variant="body2" fontWeight={700}>
                                    {item.commonName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    {item.scientificName}
                                </Typography>
                                <Chip
                                    label={t(getSwimLevelTranslationKey(item.swimLevel))}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mt: 0.75 }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <IconButton type="button" size="small" onClick={() => onDecrementSpecies(item.speciesId)}>
                                    <RemoveRoundedIcon fontSize="small" />
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    fontWeight={800}
                                    sx={{ width: 18, textAlign: 'center' }}
                                >
                                    {item.quantity}
                                </Typography>
                                <IconButton type="button" size="small" color="primary" onClick={() => onIncrementSpecies(item.speciesId)}>
                                    <AddRoundedIcon fontSize="small" />
                                </IconButton>
                                <IconButton type="button" size="small" color="error" onClick={() => onRemoveSpecies(item.speciesId)}>
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
}

export default BuilderSidebar;
