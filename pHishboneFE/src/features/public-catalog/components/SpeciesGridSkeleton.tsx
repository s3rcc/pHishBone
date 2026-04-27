import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

const SKELETON_COUNT = 6;

export const SpeciesGridSkeleton: React.FC = () => {
    return (
        <Grid container spacing={2}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'background.paper',
                        }}
                    >
                        <Skeleton variant="rectangular" height={176} animation="wave" />
                        <CardContent sx={{ p: 1.75 }}>
                            <Stack spacing={1}>
                                <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="text" width="72%" height={32} />
                                <Skeleton variant="text" width="58%" height={20} />
                                <Box sx={{ pt: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
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
