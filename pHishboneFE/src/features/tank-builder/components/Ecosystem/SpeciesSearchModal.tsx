import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    TextField, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar, 
    Avatar, 
    ListItemButton,
    InputAdornment,
    CircularProgress,
    Box,
    Typography,
    IconButton
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { publicCatalogApi } from '../../../public-catalog/api/publicCatalogApi';
import type { SpeciesDto } from '../../../catalog-management/types';
import { useTankStore } from '../../store/useTankStore';

interface SpeciesSearchModalProps {
    open: boolean;
    onClose: () => void;
}

// Simple useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export const SpeciesSearchModal: React.FC<SpeciesSearchModalProps> = ({ open, onClose }) => {
    const { t } = useTranslation('TankBuilder');
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [results, setResults] = useState<SpeciesDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const addSpecies = useTankStore((state) => state.addSpecies);

    useEffect(() => {
        if (!open) return;

        let active = true;
        setIsLoading(true);

        const fetchResults = async () => {
            try {
                // Using the already existing FTS endpoint from public catalog
                const data = await publicCatalogApi.searchSpecies(debouncedQuery);
                if (active) {
                    setResults(data);
                }
            } catch (error) {
                console.error('Failed to search species', error);
                if (active) setResults([]);
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchResults();

        return () => {
            active = false;
        };
    }, [debouncedQuery, open]);

    const handleSelect = (species: SpeciesDto) => {
        addSpecies(species); // default is 1, handled in store
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {t('searchSpecies', 'Search Species')}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    autoFocus
                    fullWidth
                    placeholder={t('searchPlaceholder', 'e.g., Neon Tetra...')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: isLoading ? (
                            <InputAdornment position="end">
                                <CircularProgress size={20} />
                            </InputAdornment>
                        ) : null,
                    }}
                    sx={{ mb: 2 }}
                />

                {results.length === 0 && !isLoading && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            {t('noResults', 'No species found.')}
                        </Typography>
                    </Box>
                )}

                <List disablePadding>
                    {results.map((species) => (
                        <ListItem key={species.id} disablePadding>
                            <ListItemButton onClick={() => handleSelect(species)}>
                                <ListItemAvatar>
                                    <Avatar src={species.thumbnailUrl} alt={species.commonName}>
                                        {species.commonName.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={species.commonName} 
                                    secondary={species.scientificName} 
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};
