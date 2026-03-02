// Placeholder page for Tags — full CRUD coming soon
import React from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const TagsPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {t('Catalog.Tags.pageTitle')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {t('Catalog.Tags.pageSubtitle')}
                </Typography>
            </Box>
            <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: '4px', fontSize: '0.78rem', py: 0.5 }}
            >
                {t('Catalog.info.tags')}
            </Alert>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 3 }}>
                {t('Catalog.Tags.comingSoon')}
            </Typography>
        </Box>
    );
};
