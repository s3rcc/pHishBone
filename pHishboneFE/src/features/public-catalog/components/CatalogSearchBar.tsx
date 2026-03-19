import React, { useCallback } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

interface CatalogSearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export const CatalogSearchBar: React.FC<CatalogSearchBarProps> = ({ value, onChange }) => {
    const { t } = useTranslation();

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        },
        [onChange],
    );

    return (
        <TextField
            fullWidth
            variant="outlined"
            placeholder={t('PublicCatalog.searchPlaceholder')}
            value={value}
            onChange={handleChange}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                },
            }}
            sx={{
                maxWidth: 600,
                mx: 'auto',
                display: 'block',
                '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 2px 12px rgba(0,188,212,0.12)',
                    },
                    '&.Mui-focused': {
                        boxShadow: '0 4px 20px rgba(0,188,212,0.18)',
                    },
                },
            }}
        />
    );
};

export default CatalogSearchBar;
