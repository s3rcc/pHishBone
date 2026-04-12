import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Group, Mesh, PlaneGeometry } from 'three';
import { DoubleSide, SRGBColorSpace, TextureLoader } from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { getAnimatedFishWorldPosition, getFishRenderScale } from '../../helpers/scene';
import type { TankDimensions, TankSceneFishSpriteProps } from '../../types';

interface FishSpritePlaneProps extends TankSceneFishSpriteProps {
    dimensions: TankDimensions;
}

const BODY_SEGMENTS = 20;
const HEIGHT_SEGMENTS = 8;
const FISH_SPRITE_MIRROR_X = -1;
const SWIM_PHASE_BASE_SPEED = 4.4;
const SWIM_PHASE_SPEED_FACTOR = 15;
const YAW_WOBBLE_AMOUNT = 0.04;
const PITCH_WOBBLE_AMOUNT = 0.012;
const ROLL_WOBBLE_AMOUNT = 0.02;
const BODY_WAVE_VERTICAL_AMOUNT = 0.01;
const BODY_WAVE_LATERAL_AMOUNT = 0.024;
const TRANSPARENT_TEXTURE_URL =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

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
    const textureUrl = fish.thumbnailUrl || TRANSPARENT_TEXTURE_URL;

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
        const swimPhase = elapsedSeconds * (SWIM_PHASE_BASE_SPEED + fish.speed * SWIM_PHASE_SPEED_FACTOR) + fish.phase * Math.PI * 2;
        const yawWobble = Math.sin(swimPhase * 0.8) * YAW_WOBBLE_AMOUNT;
        const pitchWobble = Math.cos(swimPhase * 0.6) * PITCH_WOBBLE_AMOUNT;
        const rollWobble = Math.sin(swimPhase * 0.5) * ROLL_WOBBLE_AMOUNT;

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
            positions[offset + 1] = baseY + Math.cos(wavePhase * 0.55) * planeHeight * BODY_WAVE_VERTICAL_AMOUNT * tailInfluence;
            positions[offset + 2] = Math.sin(wavePhase) * planeWidth * BODY_WAVE_LATERAL_AMOUNT * tailInfluence * sideFalloff;
        }

        positionAttribute.needsUpdate = true;
        geometry.computeBoundingSphere();
    });

    return (
        <group ref={groupRef}>
            <mesh scale={[FISH_SPRITE_MIRROR_X * (isSelected ? 1.15 : 1.08), isSelected ? 1.15 : 1.08, 1]} renderOrder={20}>
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
                scale={[FISH_SPRITE_MIRROR_X, 1, 1]}
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
