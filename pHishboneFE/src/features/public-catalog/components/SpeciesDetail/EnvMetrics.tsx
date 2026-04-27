import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import OpacityRoundedIcon from '@mui/icons-material/OpacityRounded';
import WavesRoundedIcon from '@mui/icons-material/WavesRounded';
import WaterRoundedIcon from '@mui/icons-material/WaterRounded';
import type { SpeciesEnvironmentDto } from '../../../catalog-management/types';

interface EnvMetricsProps {
    environment: SpeciesEnvironmentDto;
    title: string;
    phLabel: string;
    tempLabel: string;
    tankVolumeLabel: string;
}

interface MetricBarProps {
    label: string;
    value: string;
    start: number;
    end: number;
    scaleMin: number;
    scaleMax: number;
    gradient: string;
}

const MetricBar: React.FC<MetricBarProps> = ({
    label,
    value,
    start,
    end,
    scaleMin,
    scaleMax,
    gradient,
}) => {
    const range = scaleMax - scaleMin;
    const left = ((start - scaleMin) / range) * 100;
    const width = ((end - start) / range) * 100;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.9 }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.05em' }}>
                    {label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {value}
                </Typography>
            </Stack>
            <Box
                sx={{
                    position: 'relative',
                    height: 7,
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        insetBlock: 0,
                        left: `${left}%`,
                        width: `${width}%`,
                        borderRadius: 999,
                        background: gradient,
                        boxShadow: '0 0 14px rgba(0, 188, 212, 0.16)',
                    }}
                />
            </Box>
        </Box>
    );
};

export const EnvMetrics: React.FC<EnvMetricsProps> = ({
    environment,
    title,
    phLabel,
    tempLabel,
    tankVolumeLabel,
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <OpacityRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={700}>
                    {title}
                </Typography>
            </Stack>

            <Stack spacing={1.8}>
                <MetricBar
                    label={phLabel}
                    value={`${environment.phMin.toFixed(1)} - ${environment.phMax.toFixed(1)}`}
                    start={environment.phMin}
                    end={environment.phMax}
                    scaleMin={0}
                    scaleMax={14}
                    gradient="linear-gradient(90deg, #00BCD4 0%, #64FFDA 100%)"
                />
                <MetricBar
                    label={tempLabel}
                    value={`${environment.tempMin} - ${environment.tempMax}°C`}
                    start={environment.tempMin}
                    end={environment.tempMax}
                    scaleMin={0}
                    scaleMax={40}
                    gradient="linear-gradient(90deg, #00BCD4 0%, #FFB59E 100%)"
                />

                <Paper
                    elevation={0}
                    sx={{
                        mt: 0.5,
                        p: 1.25,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        backgroundColor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 1,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: 'rgba(0, 188, 212, 0.12)',
                            color: 'primary.main',
                            flexShrink: 0,
                        }}
                    >
                        <WaterRoundedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            {tankVolumeLabel}
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="baseline">
                            <Typography variant="subtitle1" fontWeight={700}>
                                {environment.minTankVolume}L
                            </Typography>
                            <WavesRoundedIcon sx={{ color: 'primary.main', fontSize: 17 }} />
                        </Stack>
                    </Box>
                </Paper>
            </Stack>
        </Paper>
    );
};

export default EnvMetrics;
