import React from 'react';
import { Grid, Skeleton, Box, Card, CardContent } from '@mui/material';

const SKELETON_COUNT = 8;

export const SpeciesGridSkeleton: React.FC = () => {
    return (
        <Grid container spacing={3}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Skeleton
                            variant="rectangular"
                            height={200}
                            animation="wave"
                        />
                        <CardContent sx={{ p: 2 }}>
                            <Skeleton variant="text" width="75%" height={28} />
                            <Skeleton variant="text" width="55%" height={20} sx={{ mb: 1.5 }} />
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
                                <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default SpeciesGridSkeleton;
