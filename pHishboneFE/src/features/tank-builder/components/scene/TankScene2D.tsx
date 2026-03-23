import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getFishRenderScale, getSceneFishRenderState } from '../../helpers/scene';
import type { BuilderSceneViewportProps } from '../../types';

function useElapsedSeconds(): number {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        let frameId = 0;
        const start = performance.now();

        const tick = (): void => {
            setElapsedSeconds((performance.now() - start) / 1000);
            frameId = window.requestAnimationFrame(tick);
        };

        frameId = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, []);

    return elapsedSeconds;
}

export function TankScene2D({
    dimensions,
    fish,
    selectedSpeciesId,
    onSelectSpecies,
    isDropActive,
}: BuilderSceneViewportProps): ReactElement {
    const { t } = useTranslation();
    const elapsedSeconds = useElapsedSeconds();

    return (
        <Box
            onClick={() => onSelectSpecies(null)}
            sx={{
                position: 'relative',
                minHeight: { xs: 360, lg: 540 },
                borderRadius: 5,
                overflow: 'hidden',
                border: '1px solid rgba(77, 208, 225, 0.22)',
                background:
                    'radial-gradient(circle at 20% 10%, rgba(29,233,182,0.14), transparent 30%), linear-gradient(180deg, rgba(5,18,28,0.92) 0%, rgba(11,34,54,0.97) 72%, rgba(18,76,96,0.98) 100%)',
                boxShadow: isDropActive
                    ? '0 0 0 2px rgba(29,233,182,0.22), inset 0 0 40px rgba(29,233,182,0.18)'
                    : 'inset 0 0 24px rgba(0, 188, 212, 0.10)',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: { xs: '10% 6% 10% 6%', lg: '10% 7% 10% 7%' },
                    borderRadius: 4,
                    border: '2px solid rgba(120, 235, 255, 0.72)',
                    background:
                        'linear-gradient(180deg, rgba(186,245,255,0.12) 0%, rgba(54,141,176,0.12) 60%, rgba(12,57,78,0.28) 100%)',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(180deg, rgba(255,255,255,0.08), transparent 20%), repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 44px)',
                        pointerEvents: 'none',
                    }}
                />

                {Array.from({ length: 2 }, (_, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${(index + 1) * 33.33}%`,
                            borderTop: '1px dashed rgba(120, 235, 255, 0.18)',
                            pointerEvents: 'none',
                        }}
                    />
                ))}

                {fish.map((entry) => {
                    const renderState = getSceneFishRenderState(entry, dimensions, elapsedSeconds);
                    const renderScale = getFishRenderScale(entry.adultSize, dimensions, entry.scale);
                    const spriteWidth = 72 * renderScale;
                    const spriteHeight = spriteWidth * 0.58;

                    return (
                        <Box
                            key={entry.id}
                            onClick={(event) => {
                                event.stopPropagation();
                                onSelectSpecies(entry.speciesId);
                            }}
                            sx={{
                                position: 'absolute',
                                left: `${renderState.projection.leftPercent}%`,
                                top: `${renderState.projection.topPercent + renderState.bobOffsetPercent}%`,
                                width: spriteWidth,
                                height: spriteHeight,
                                transform: `translate(-50%, -50%) scaleX(${renderState.facingDirection})`,
                                opacity: 0.68 + renderState.projection.depthPercent / 320,
                                zIndex: Math.round(renderState.projection.depthPercent),
                                cursor: 'pointer',
                                filter:
                                    selectedSpeciesId === entry.speciesId
                                        ? 'drop-shadow(0 0 14px rgba(29,233,182,0.78))'
                                        : 'drop-shadow(0 6px 12px rgba(0,0,0,0.26))',
                            }}
                        >
                            {entry.thumbnailUrl ? (
                                <Box
                                    component="img"
                                    src={entry.thumbnailUrl}
                                    alt={entry.commonName}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        opacity: 0.96,
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50% 50% 45% 45%',
                                        background:
                                            'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(94,226,239,0.82), rgba(29,233,182,0.92))',
                                        clipPath:
                                            'polygon(0% 48%, 18% 22%, 58% 16%, 88% 30%, 100% 50%, 88% 70%, 58% 84%, 18% 78%)',
                                    }}
                                />
                            )}
                        </Box>
                    );
                })}

                {fish.length === 0 ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            px: 3,
                        }}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                                {t('TankBuilder.tankSceneEmpty')}
                            </Typography>
                            <Typography variant="body2" color="rgba(232,244,248,0.76)">
                                {t('TankBuilder.dropFishHere')}
                            </Typography>
                        </Box>
                    </Box>
                ) : null}
            </Box>

            <Typography
                variant="caption"
                sx={{
                    position: 'absolute',
                    bottom: '4.5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(232,244,248,0.86)',
                    letterSpacing: 1,
                }}
            >
                {t('TankBuilder.frontViewLabel')}
            </Typography>
        </Box>
    );
}

export default TankScene2D;
