import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SpeciesForm } from './species-form/SpeciesForm';

/**
 * Species Create Page – renders the blank multi-tab form.
 */
export const SpeciesCreatePage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Box>
            <Box
                sx={{
                    px: 3,
                    pt: 2,
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <Typography variant="overline" color="text.secondary">
                    {t('Catalog.Species.newEntryBreadcrumb')}
                </Typography>
            </Box>
            <SpeciesForm mode="create" />
        </Box>
    );
};

export default SpeciesCreatePage;
