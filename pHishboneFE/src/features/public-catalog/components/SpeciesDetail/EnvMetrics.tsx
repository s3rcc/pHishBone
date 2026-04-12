import React, { useMemo } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SpeciesEnvironmentDto } from '../../../catalog-management/types';

interface EnvMetricsProps {
    environment: SpeciesEnvironmentDto;
}

// ─── Scale definitions ───────────────────────────────────────────────────────
const PH_MIN = 0;
const PH_MAX = 14;
const TEMP_MIN = 0;
const TEMP_MAX = 40;

interface RangeBarProps {
    label: string;
    min: number;
    max: number;
    scaleMin: number;
    scaleMax: number;
    unit: string;
    color: string;
}

const RangeBar: React.FC<RangeBarProps> = ({ label, min, max, scaleMin, scaleMax, unit, color }) => {
    const scaleRange = scaleMax - scaleMin;
    const leftPct = ((min - scaleMin) / scaleRange) * 100;
    const widthPct = ((max - min) / scaleRange) * 100;

    const ticks = useMemo(() => {
        const result: number[] = [];
        const step = scaleMax <= 14 ? 2 : 10;
        for (let i = scaleMin; i <= scaleMax; i += step) {
            result.push(i);
        }
        return result;
    }, [scaleMin, scaleMax]);

    return (
        <Box>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ mb: 1 }}
            >
                <Typography variant="body2" fontWeight={600} color="text.primary">
                    {label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {min} – {max} {unit}
                </Typography>
            </Stack>

            {/* ── Track ───────────────────────────────────────────── */}
            <Box
                sx={{
                    position: 'relative',
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: 'action.hover',
                    overflow: 'hidden',
                }}
            >
                {/* ── Active range indicator ──────────────────────── */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        borderRadius: 6,
                        background: `linear-gradient(90deg, ${color}88, ${color})`,
                        transition: 'all 0.3s ease',
                    }}
                />
            </Box>

            {/* ── Scale ticks ─────────────────────────────────────── */}
            <Box
                sx={{
                    position: 'relative',
                    height: 16,
                    mt: 0.25,
                }}
            >
                {ticks.map((tick) => {
                    const pos = ((tick - scaleMin) / scaleRange) * 100;
                    return (
                        <Typography
                            key={tick}
                            variant="caption"
                            sx={{
                                position: 'absolute',
                                left: `${pos}%`,
                                transform: 'translateX(-50%)',
                                color: 'text.secondary',
                                fontSize: '0.65rem',
                            }}
                        >
                            {tick}
                        </Typography>
                    );
                })}
            </Box>
        </Box>
    );
};

export const EnvMetrics: React.FC<EnvMetricsProps> = ({ environment }) => {
    const { t } = useTranslation();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                {t('PublicCatalog.Detail.envTitle')}
            </Typography>

            <Stack spacing={3}>
                <RangeBar
                    label={t('PublicCatalog.Detail.phRange')}
                    min={environment.phMin}
                    max={environment.phMax}
                    scaleMin={PH_MIN}
                    scaleMax={PH_MAX}
                    unit="pH"
                    color="#00BCD4"
                />

                <RangeBar
                    label={t('PublicCatalog.Detail.tempRange')}
                    min={environment.tempMin}
                    max={environment.tempMax}
                    scaleMin={TEMP_MIN}
                    scaleMax={TEMP_MAX}
                    unit="°C"
                    color="#1DE9B6"
                />
            </Stack>
        </Paper>
    );
};

export default EnvMetrics;
