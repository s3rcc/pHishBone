import { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import type { DragEvent, ReactElement } from 'react';
import { Box, Paper } from '@mui/material';
import { resolveSceneFish } from '../helpers/scene';
import type {
    TankDimensions,
    TankSceneFishInstance,
    TankSceneViewMode,
    TankSpeciesDraft,
} from '../types';
import TankDimensionInputs from './scene/TankDimensionInputs';
import TankSceneToolbar from './scene/TankSceneToolbar';
import TankScene2D from './scene/TankScene2D';
import type { SpeciesDto } from '../../catalog-management/types';

const TankScene3D = lazy(() => import('./scene/TankScene3D'));

interface BuilderSceneProps {
    dimensions: TankDimensions;
    inventory: TankSpeciesDraft[];
    sceneFish: TankSceneFishInstance[];
    selectedSpeciesId: string | null;
    viewMode: TankSceneViewMode;
    showSceneBubbles: boolean;
    onChangeViewMode: (viewMode: TankSceneViewMode) => void;
    onToggleSceneBubbles: (enabled: boolean) => void;
    onSelectSpecies: (speciesId: string | null) => void;
    onSetDimensions: (dimensions: Partial<TankDimensions>) => void;
    onAddSpecies: (species: SpeciesDto) => Promise<void>;
}

function SceneLoadingFallback(): ReactElement {
    return (
        <Box
            sx={{
                minHeight: { xs: 360, lg: 540 },
                borderRadius: 5,
                border: '1px solid rgba(77, 208, 225, 0.22)',
                background:
                    'linear-gradient(180deg, rgba(5,18,28,0.92) 0%, rgba(10,37,56,0.98) 72%, rgba(18,76,96,0.98) 100%)',
            }}
        />
    );
}

export function BuilderScene({
    dimensions,
    inventory,
    sceneFish,
    selectedSpeciesId,
    viewMode,
    showSceneBubbles,
    onChangeViewMode,
    onToggleSceneBubbles,
    onSelectSpecies,
    onSetDimensions,
    onAddSpecies,
}: BuilderSceneProps): ReactElement {
    const [isDropActive, setIsDropActive] = useState(false);

    const resolvedSceneFish = useMemo(() => resolveSceneFish(sceneFish, inventory), [inventory, sceneFish]);
    const volumeLiters = useMemo(
        () => (dimensions.length * dimensions.width * dimensions.height) / 1000,
        [dimensions.height, dimensions.length, dimensions.width],
    );

    const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDropActive(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDropActive(false);
    }, []);

    const handleDrop = useCallback(
        async (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDropActive(false);

            const payload = event.dataTransfer.getData('application/phishbone-species');
            if (!payload) {
                return;
            }

            const species = JSON.parse(payload) as SpeciesDto;
            await onAddSpecies(species);
        },
        [onAddSpecies],
    );

    return (
        <Paper
            sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 4,
                border: '1px solid rgba(0, 188, 212, 0.16)',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(180deg, rgba(7,20,32,0.96), rgba(12,35,56,0.96))'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.99), rgba(234,248,251,0.99))',
                overflow: 'hidden',
            }}
        >
            <TankSceneToolbar
                viewMode={viewMode}
                volumeLiters={volumeLiters}
                showSceneBubbles={showSceneBubbles}
                onChangeViewMode={onChangeViewMode}
                onToggleSceneBubbles={onToggleSceneBubbles}
            />

            <TankDimensionInputs dimensions={dimensions} onSetDimensions={onSetDimensions} />

            <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                {viewMode === '3d' ? (
                    <Suspense fallback={<SceneLoadingFallback />}>
                        <TankScene3D
                            dimensions={dimensions}
                            fish={resolvedSceneFish}
                            selectedSpeciesId={selectedSpeciesId}
                            onSelectSpecies={onSelectSpecies}
                            showSceneBubbles={showSceneBubbles}
                            isDropActive={isDropActive}
                        />
                    </Suspense>
                ) : (
                    <TankScene2D
                        dimensions={dimensions}
                        fish={resolvedSceneFish}
                        selectedSpeciesId={selectedSpeciesId}
                        onSelectSpecies={onSelectSpecies}
                        showSceneBubbles={showSceneBubbles}
                        isDropActive={isDropActive}
                    />
                )}
            </Box>
        </Paper>
    );
}

export default BuilderScene;
