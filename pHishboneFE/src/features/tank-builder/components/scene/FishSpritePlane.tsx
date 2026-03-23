import { useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Group } from 'three';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { getAnimatedFishWorldPosition, getFishRenderScale } from '../../helpers/scene';
import type { TankDimensions, TankSceneFishSpriteProps } from '../../types';

interface FishSpritePlaneProps extends TankSceneFishSpriteProps {
    dimensions: TankDimensions;
}

function getFallbackGradient(speciesId: string): string {
    const palette = [
        'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(94,226,239,0.88), rgba(29,233,182,0.95))',
        'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(140,196,255,0.86), rgba(36,143,255,0.92))',
        'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,196,112,0.9), rgba(255,128,84,0.92))',
    ];

    const hash = Array.from(speciesId).reduce((total, char) => total + char.charCodeAt(0), 0);
    return palette[hash % palette.length];
}

export function FishSpritePlane({
    dimensions,
    fish,
    isSelected,
    onSelect,
}: FishSpritePlaneProps): ReactElement {
    const groupRef = useRef<Group | null>(null);

    const fallbackGradient = useMemo(() => getFallbackGradient(fish.speciesId), [fish.speciesId]);
    const renderScale = useMemo(
        () => getFishRenderScale(fish.adultSize, dimensions, fish.scale),
        [dimensions, fish.adultSize, fish.scale],
    );
    const spriteWidth = 72 * renderScale;
    const spriteHeight = spriteWidth * 0.58;

    useFrame((state) => {
        const group = groupRef.current;
        if (!group) {
            return;
        }

        const animatedPosition = getAnimatedFishWorldPosition(fish, dimensions, state.clock.getElapsedTime());
        group.position.set(animatedPosition.x, animatedPosition.y, animatedPosition.z);
        group.rotation.set(0, animatedPosition.facingDirection === 1 ? 0 : Math.PI, 0);
    });

    return (
        <group ref={groupRef}>
            <Html transform sprite center distanceFactor={10}>
                <div
                    onClick={() => onSelect(fish.speciesId)}
                    style={{
                        width: `${spriteWidth}px`,
                        height: `${spriteHeight}px`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'auto',
                        filter: isSelected
                            ? 'drop-shadow(0 0 14px rgba(29, 233, 182, 0.72))'
                            : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.22))',
                    }}
                >
                    {fish.thumbnailUrl ? (
                        <img
                            src={fish.thumbnailUrl}
                            alt={fish.commonName}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                opacity: 0.98,
                                filter: isSelected ? 'saturate(1.08)' : 'none',
                            }}
                        />
                    ) : (
                        <div
                            aria-label={fish.commonName}
                            style={{
                                width: '100%',
                                height: '100%',
                                background: fallbackGradient,
                                clipPath: 'polygon(0% 48%, 18% 22%, 58% 16%, 88% 30%, 100% 50%, 88% 70%, 58% 84%, 18% 78%)',
                            }}
                        />
                    )}
                </div>
            </Html>
        </group>
    );
}

export default FishSpritePlane;
