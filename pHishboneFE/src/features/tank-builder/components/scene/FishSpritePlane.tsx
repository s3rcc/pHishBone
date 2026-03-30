import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Group, Mesh, PlaneGeometry } from 'three';
import { DoubleSide, SRGBColorSpace, TextureLoader } from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import fishPlaneUrl from '../../../../assets/fish-plane.png';
import { getAnimatedFishWorldPosition, getFishRenderScale } from '../../helpers/scene';
import type { TankDimensions, TankSceneFishSpriteProps } from '../../types';

interface FishSpritePlaneProps extends TankSceneFishSpriteProps {
    dimensions: TankDimensions;
}

const BODY_SEGMENTS = 20;
const HEIGHT_SEGMENTS = 8;

function clamp01(value: number): number {
    return Math.min(Math.max(value, 0), 1);
}

export function FishSpritePlane({
    dimensions,
    fish,
    isSelected,
    onSelect,
}: FishSpritePlaneProps): ReactElement {
    const groupRef = useRef<Group | null>(null);
    const geometryRef = useRef<PlaneGeometry | null>(null);
    const basePositionsRef = useRef<Float32Array | null>(null);
    const bodyMeshRef = useRef<Mesh | null>(null);
    const textureUrl = fish.thumbnailUrl || fishPlaneUrl;

    const fishTexture = useLoader(TextureLoader, textureUrl, (loader) => {
        loader.setCrossOrigin('anonymous');
    });

    const renderScale = useMemo(
        () => getFishRenderScale(fish.adultSize, dimensions, fish.scale),
        [dimensions, fish.adultSize, fish.scale],
    );
    const textureAspectRatio =
        fishTexture.image && 'width' in fishTexture.image && 'height' in fishTexture.image && fishTexture.image.width > 0
            ? fishTexture.image.height / fishTexture.image.width
            : 0.5;
    const planeWidth = Math.max(0.9 * renderScale, 0.42);
    const planeHeight = planeWidth * textureAspectRatio;

    useEffect(() => {
        fishTexture.colorSpace = SRGBColorSpace;
        fishTexture.needsUpdate = true;
    }, [fishTexture]);

    useEffect(() => {
        if (!import.meta.env.DEV) {
            return;
        }

        console.debug('[FishSpritePlane] mount', {
            id: fish.id,
            speciesId: fish.speciesId,
            commonName: fish.commonName,
            textureUrl,
            scale: renderScale,
            dimensions,
        });
    }, [dimensions, fish.commonName, fish.id, fish.speciesId, renderScale, textureUrl]);

    useLayoutEffect(() => {
        const geometry = geometryRef.current;
        const positionAttribute = geometry?.attributes.position;

        if (!positionAttribute) {
            basePositionsRef.current = null;
            return;
        }

        basePositionsRef.current = Float32Array.from(positionAttribute.array as ArrayLike<number>);
    }, [planeHeight, planeWidth]);

    useFrame((state) => {
        const group = groupRef.current;
        const geometry = geometryRef.current;
        const basePositions = basePositionsRef.current;

        if (!group || !geometry || !basePositions) {
            return;
        }

        const elapsedSeconds = state.clock.getElapsedTime();
        const animatedPosition = getAnimatedFishWorldPosition(fish, dimensions, elapsedSeconds);
        const swimPhase = elapsedSeconds * (3.2 + fish.speed * 18) + fish.phase * Math.PI * 2;
        const yawWobble = Math.sin(swimPhase * 0.8) * 0.08;
        const pitchWobble = Math.cos(swimPhase * 0.6) * 0.025;
        const rollWobble = Math.sin(swimPhase * 0.5) * 0.045;

        group.position.set(animatedPosition.x, animatedPosition.y, animatedPosition.z);
        group.rotation.set(
            -(animatedPosition.pitch + pitchWobble),
            (Math.PI / 2) - animatedPosition.headingYaw + yawWobble,
            animatedPosition.bank + rollWobble,
        );

        const positionAttribute = geometry.attributes.position;
        const positions = positionAttribute.array as Float32Array;

        for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex += 1) {
            const offset = vertexIndex * 3;
            const baseX = basePositions[offset];
            const baseY = basePositions[offset + 1];
            const normalizedX = planeWidth === 0 ? 0.5 : clamp01((baseX + planeWidth / 2) / planeWidth);
            const normalizedY = planeHeight === 0 ? 0.5 : clamp01(Math.abs(baseY) / (planeHeight / 2));
            const tailInfluence = Math.pow(1 - normalizedX, 1.55);
            const sideFalloff = 1 - normalizedY * 0.38;
            const wavePhase = swimPhase * 2.2 + normalizedX * Math.PI * 2.7;

            positions[offset] = baseX;
            positions[offset + 1] = baseY + Math.cos(wavePhase * 0.55) * planeHeight * 0.018 * tailInfluence;
            positions[offset + 2] = Math.sin(wavePhase) * planeWidth * 0.048 * tailInfluence * sideFalloff;
        }

        positionAttribute.needsUpdate = true;
        geometry.computeBoundingSphere();
    });

    return (
        <group ref={groupRef}>
            <mesh scale={isSelected ? 1.15 : 1.08} renderOrder={20}>
                <planeGeometry args={[planeWidth, planeHeight, 1, 1]} />
                <meshBasicMaterial
                    color={isSelected ? '#75f7ff' : '#45b8cf'}
                    map={fishTexture}
                    transparent
                    opacity={isSelected ? 0.3 : 0.14}
                    side={DoubleSide}
                    depthTest={false}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            <mesh
                ref={bodyMeshRef}
                onClick={(event) => {
                    event.stopPropagation();
                    onSelect(fish.speciesId);
                }}
                renderOrder={30}
            >
                <planeGeometry ref={geometryRef} args={[planeWidth, planeHeight, BODY_SEGMENTS, HEIGHT_SEGMENTS]} />
                <meshBasicMaterial
                    map={fishTexture}
                    transparent
                    alphaTest={0.06}
                    side={DoubleSide}
                    depthTest={false}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

export default FishSpritePlane;
