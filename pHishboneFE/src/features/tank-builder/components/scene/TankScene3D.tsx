import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Edges, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { getTankRenderDimensions } from '../../helpers/scene';
import type { BuilderSceneViewportProps, TankDimensions, TankSceneFish } from '../../types';
import FishSpritePlane from './FishSpritePlane';

interface TankBoxProps {
    dimensions: TankDimensions;
}

interface TankSceneContentProps extends BuilderSceneViewportProps {
    fish: TankSceneFish[];
}

function TankGlassBox({ dimensions }: TankBoxProps): ReactElement {
    const renderDimensions = useMemo(() => getTankRenderDimensions(dimensions), [dimensions]);

    return (
        <group>
            <mesh>
                <boxGeometry args={[renderDimensions.length, renderDimensions.height, renderDimensions.width]} />
                <meshPhysicalMaterial
                    color="#b3f0ff"
                    transparent
                    opacity={0.1}
                    roughness={0.08}
                    transmission={0.88}
                    thickness={0.6}
                />
                <Edges scale={1.005} color="#aef4ff" />
            </mesh>

            <mesh>
                <boxGeometry
                    args={[
                        renderDimensions.length * 0.96,
                        renderDimensions.height * 0.96,
                        renderDimensions.width * 0.96,
                    ]}
                />
                <meshStandardMaterial color="#34c6dc" transparent opacity={0.09} />
            </mesh>

            <mesh position={[0, -renderDimensions.height / 2 + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[renderDimensions.length * 0.96, renderDimensions.width * 0.96]} />
                <meshStandardMaterial color="#124960" transparent opacity={0.42} />
            </mesh>

            <mesh position={[0, renderDimensions.height / 2 - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[renderDimensions.length * 0.96, renderDimensions.width * 0.96]} />
                <meshStandardMaterial color="#b8f6ff" transparent opacity={0.08} />
            </mesh>
        </group>
    );
}

function TankSceneContent({
    dimensions,
    fish,
    selectedSpeciesId,
    onSelectSpecies,
}: TankSceneContentProps): ReactElement {
    const renderDimensions = useMemo(() => getTankRenderDimensions(dimensions), [dimensions]);

    return (
        <>
            <ambientLight intensity={0.85} />
            <directionalLight position={[6, 8, 4]} intensity={0.95} color="#d9fcff" />
            <pointLight position={[-4, 2, 5]} intensity={0.7} color="#7be8ff" />

            <mesh position={[0, -renderDimensions.height / 2 - 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#071827" transparent opacity={0.58} />
            </mesh>

            <TankGlassBox dimensions={dimensions} />

            {fish.map((entry) => (
                <FishSpritePlane
                    key={entry.id}
                    dimensions={dimensions}
                    fish={entry}
                    isSelected={selectedSpeciesId === entry.speciesId}
                    onSelect={onSelectSpecies}
                />
            ))}

            <OrbitControls enablePan={false} minDistance={5} maxDistance={14} />
        </>
    );
}

export function TankScene3D({
    dimensions,
    fish,
    selectedSpeciesId,
    onSelectSpecies,
    isDropActive,
}: BuilderSceneViewportProps): ReactElement {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: { xs: 360, lg: 540 },
                borderRadius: 5,
                overflow: 'hidden',
                border: '1px solid rgba(77, 208, 225, 0.22)',
                background:
                    'radial-gradient(circle at 20% 10%, rgba(29,233,182,0.14), transparent 30%), linear-gradient(180deg, rgba(4,16,24,0.96) 0%, rgba(9,26,42,0.97) 72%, rgba(17,64,83,0.98) 100%)',
                boxShadow: isDropActive
                    ? '0 0 0 2px rgba(29,233,182,0.22), inset 0 0 40px rgba(29,233,182,0.18)'
                    : 'inset 0 0 24px rgba(0, 188, 212, 0.10)',
            }}
        >
            <Canvas
                shadows={false}
                camera={{ position: [6.8, 5.4, 7.2], fov: 38 }}
                onPointerMissed={() => onSelectSpecies(null)}
                style={{ position: 'absolute', inset: 0 }}
            >
                <TankSceneContent
                    dimensions={dimensions}
                    fish={fish}
                    selectedSpeciesId={selectedSpeciesId}
                    onSelectSpecies={onSelectSpecies}
                    isDropActive={isDropActive}
                />
            </Canvas>

            <Box
                sx={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 999,
                    border: '1px solid rgba(140, 238, 255, 0.2)',
                    background: 'rgba(6, 18, 30, 0.42)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Typography variant="caption" color="rgba(232,244,248,0.86)">
                    {t('TankBuilder.orbitHint')}
                </Typography>
            </Box>

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
                        pointerEvents: 'none',
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
    );
}

export default TankScene3D;
