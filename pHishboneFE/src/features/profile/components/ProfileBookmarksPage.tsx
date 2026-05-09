import React, { Suspense, useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ProfileBookmarksResults } from './ProfileBookmarksResults';
import { ProfileShell } from './ProfileShell';
import type { SpeciesBookmarkFilterDto, SpeciesBookmarkSortBy } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const PAGE_SIZE_OPTIONS = [8, 12, 24] as const;

function BookmarkResultsFallback(): React.ReactElement {
    return (
        <Grid container spacing={2.5}>
            {Array.from({ length: 4 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, md: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.25,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
                            <Skeleton variant="text" width="45%" height={30} />
                            <Skeleton variant="text" width="70%" />
                            <Skeleton variant="text" width="38%" />
                            <Stack direction="row" spacing={1}>
                                <Skeleton variant="rounded" width={120} height={36} />
                                <Skeleton variant="rounded" width={90} height={36} />
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}

export const ProfileBookmarksPage: React.FC = () => {
    const { t } = useTranslation();
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState<SpeciesBookmarkSortBy>('bookmarkedTime');
    const deferredSearchTerm = useDeferredValue(searchInput.trim());

    const filter = useMemo<SpeciesBookmarkFilterDto>(
        () => ({
            page,
            size,
            searchTerm: deferredSearchTerm || undefined,
            sortBy,
            isAscending: false,
        }),
        [deferredSearchTerm, page, size, sortBy],
    );

    const handlePageChange = useCallback((nextPage: number) => {
        setPage(nextPage);
    }, []);

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
        setPage(DEFAULT_PAGE);
    }, []);

    const handleSortChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSortBy(event.target.value as SpeciesBookmarkSortBy);
        setPage(DEFAULT_PAGE);
    }, []);

    const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSize(Number(event.target.value));
        setPage(DEFAULT_PAGE);
    }, []);

    return (
        <ProfileShell>
            <Stack spacing={3}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2.25, md: 2.5 },
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={2.5}>
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                                <FavoriteRoundedIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight={800}>
                                    {t('Profile.Bookmarks.sectionTitle')}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                {t('Profile.Bookmarks.sectionSubtitle')}
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    placeholder={t('Profile.Bookmarks.searchPlaceholder')}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRoundedIcon fontSize="small" color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label={t('Profile.Bookmarks.sortByLabel')}
                                    value={sortBy}
                                    onChange={handleSortChange}
                                >
                                    <MenuItem value="bookmarkedTime">
                                        {t('Profile.Bookmarks.sortBookmarkedTime')}
                                    </MenuItem>
                                    <MenuItem value="commonName">
                                        {t('Profile.Bookmarks.sortCommonName')}
                                    </MenuItem>
                                    <MenuItem value="scientificName">
                                        {t('Profile.Bookmarks.sortScientificName')}
                                    </MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label={t('Profile.Bookmarks.pageSizeLabel')}
                                    value={String(size)}
                                    onChange={handlePageSizeChange}
                                >
                                    {PAGE_SIZE_OPTIONS.map((option) => (
                                        <MenuItem key={option} value={String(option)}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Stack>
                </Paper>

                <Suspense fallback={<BookmarkResultsFallback />}>
                    <ProfileBookmarksResults
                        filter={filter}
                        page={page}
                        onPageChange={handlePageChange}
                    />
                </Suspense>
            </Stack>
        </ProfileShell>
    );
};

export default ProfileBookmarksPage;
