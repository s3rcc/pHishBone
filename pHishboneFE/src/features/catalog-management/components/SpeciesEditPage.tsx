import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { SpeciesForm } from './species-form/SpeciesForm';
import { useSpeciesDetail } from '../hooks/useCatalog';

interface Props {
    speciesId: string;
}

function EditFormInner({ speciesId }: Props) {
    const { data: detail } = useSpeciesDetail(speciesId);
    return <SpeciesForm mode="edit" speciesId={speciesId} defaultValues={detail} />;
}

/**
 * Species Edit Page – fetches the species detail via Suspense then renders the pre-populated form.
 */
export const SpeciesEditPage: React.FC<Props> = ({ speciesId }) => {
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
                    {t('Catalog.Species.editBreadcrumb')}
                </Typography>
            </Box>
            <Suspense
                fallback={
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={32} />
                    </Box>
                }
            >
                <EditFormInner speciesId={speciesId} />
            </Suspense>
        </Box>
    );
};

export default SpeciesEditPage;
