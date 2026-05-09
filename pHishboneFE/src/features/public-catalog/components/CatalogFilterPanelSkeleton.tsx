import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

export const CatalogFilterPanelSkeleton: React.FC = () => {
    return (
        <Box
            sx={{
                width: { xs: '100%', lg: 288 },
                flexShrink: 0,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 1.75, md: 2 },
            }}
        >
            <Stack spacing={2}>
                <Skeleton variant="text" width={140} height={34} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={88} />
                <Skeleton variant="rounded" height={116} />
                <Skeleton variant="rounded" height={92} />
                <Skeleton variant="rounded" height={36} width="70%" />
            </Stack>
        </Box>
    );
};

export default CatalogFilterPanelSkeleton;
