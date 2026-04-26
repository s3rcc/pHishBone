import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

const SKELETON_COUNT = 6;

export const SpeciesGridSkeleton: React.FC = () => {
    return (
        <Grid container spacing={2.25}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, xl: 4 }}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid rgba(52, 228, 234, 0.08)',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                        }}
                    >
                        <Skeleton variant="rectangular" height={228} animation="wave" />
                        <CardContent sx={{ p: 2.25 }}>
                            <Stack spacing={1.25}>
                                <Skeleton variant="rounded" width={82} height={24} sx={{ borderRadius: 1.5 }} />
                                <Skeleton variant="text" width="72%" height={38} />
                                <Skeleton variant="text" width="58%" height={24} />
                                <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Skeleton variant="text" width={110} height={20} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default SpeciesGridSkeleton;
