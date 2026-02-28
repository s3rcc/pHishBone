import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

const LOCALES = ['en', 'vi'] as const;
type Locale = (typeof LOCALES)[number];

/** EN / VI toggle button placed in the Navbar. Reads and writes through i18next. */
export const LanguageSwitcher: React.FC = () => {
    const { i18n, t } = useTranslation();

    // Normalise language code — browser may return 'en-US', we only want 'en'
    const current = (i18n.language?.split('-')[0] ?? 'en') as Locale;
    const activeLocale: Locale = LOCALES.includes(current) ? current : 'en';

    const handleChange = useCallback(
        (_: React.MouseEvent<HTMLElement>, value: Locale | null) => {
            if (value) i18n.changeLanguage(value);
        },
        [i18n],
    );

    return (
        <Tooltip title={t('Navigation.switchLanguage')}>
            <ToggleButtonGroup
                value={activeLocale}
                exclusive
                onChange={handleChange}
                size="small"
                aria-label="language switcher"
                sx={{
                    mr: 1,
                    height: 32,
                    border: '1px solid rgba(0, 188, 212, 0.3)',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    '& .MuiToggleButtonGroup-grouped': {
                        border: 'none',
                        borderRadius: 0,
                        px: 1.25,
                        py: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        color: 'text.secondary',
                        '&.Mui-selected': {
                            color: 'primary.light',
                            bgcolor: 'rgba(0, 188, 212, 0.15)',
                        },
                        '&:hover': {
                            bgcolor: 'rgba(0, 188, 212, 0.08)',
                        },
                    },
                }}
            >
                <ToggleButton value="en" aria-label="English">
                    EN
                </ToggleButton>
                <ToggleButton value="vi" aria-label="Tiếng Việt">
                    VI
                </ToggleButton>
            </ToggleButtonGroup>
        </Tooltip>
    );
};

export default LanguageSwitcher;
