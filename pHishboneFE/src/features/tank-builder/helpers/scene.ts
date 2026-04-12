import type { SwimLevel } from '../../catalog-management/types';
import type {
    AnimatedTankWorldPosition,
    SceneFishRenderState,
    TankDimensions,
    TankRenderDimensions,
    TankSceneFish,
    TankSceneFishInstance,
    TankSceneProjection,
    TankSpeciesDraft,
    TankSwimBand,
    TankVolumeBounds,
} from '../types';

const MIN_MARGIN_CM = 2;
const MARGIN_RATIO = 0.05;
const MAX_RENDER_AXIS = 6.2;
const FALLBACK_ADULT_SIZE_CM = 6;

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function normalizeMargin(dimension: number): number {
    if (dimension <= 0) {
        return 0;
    }

    return clamp(Math.max(MIN_MARGIN_CM, dimension * MARGIN_RATIO) / dimension, 0.02, 0.18);
}

function createSceneFishId(speciesId: string, instanceIndex: number): string {
    const randomSuffix =
        globalThis.crypto && 'randomUUID' in globalThis.crypto
            ? globalThis.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return `${speciesId}-${instanceIndex}-${randomSuffix}`;
}

function getSpeciesMap(inventory: TankSpeciesDraft[]): Map<string, TankSpeciesDraft> {
    return new Map(inventory.map((item) => [item.speciesId, item]));
}

function getNextInstanceIndex(sceneFish: TankSceneFishInstance[], speciesId: string): number {
    const highestIndex = sceneFish
        .filter((entry) => entry.speciesId === speciesId)
        .reduce((maxIndex, entry) => Math.max(maxIndex, entry.instanceIndex), -1);

    return highestIndex + 1;
}

function getCompositeLateralOffset(elapsedSeconds: number, speed: number, phase: number, direction: -1 | 1): number {
    const baseTime = elapsedSeconds * speed * Math.PI * 2;
    const primary = Math.sin(baseTime + phase * Math.PI * 2);
    const secondary = Math.sin(baseTime * 0.43 + phase * Math.PI * 3.4);
    const tertiary = Math.sin(baseTime * 0.21 + phase * Math.PI * 5.2);

    return direction * (primary * 0.62 + secondary * 0.25 + tertiary * 0.13);
}

function getAxisAmplitude(center: number, min: number, max: number, target: number, floor: number): number {
    return Math.max(floor, Math.min(center - min, max - center, target));
}

export function getTankVolumeBounds(dimensions: TankDimensions): TankVolumeBounds {
    const xMargin = normalizeMargin(dimensions.length);
    const yMarginBottom = normalizeMargin(dimensions.height);
    const yMarginTop = normalizeMargin(dimensions.height);
    const zMargin = normalizeMargin(dimensions.width);

    return {
        xMin: xMargin,
        xMax: 1 - xMargin,
        yMin: yMarginBottom,
        yMax: 1 - yMarginTop,
        zMin: zMargin,
        zMax: 1 - zMargin,
    };
}

export function getSwimBand(swimLevel: SwimLevel, dimensions: TankDimensions): TankSwimBand {
    const bounds = getTankVolumeBounds(dimensions);
    const usableHeight = bounds.yMax - bounds.yMin;
    const bandHeight = usableHeight / 3;

    switch (swimLevel) {
        case 0:
            return {
                yMin: bounds.yMax - bandHeight,
                yMax: bounds.yMax,
            };
        case 1:
            return {
                yMin: bounds.yMin + bandHeight,
                yMax: bounds.yMax - bandHeight,
            };
        case 2:
            return {
                yMin: bounds.yMin,
                yMax: bounds.yMin + bandHeight,
            };
        default:
            return {
                yMin: bounds.yMin,
                yMax: bounds.yMax,
            };
    }
}

export function createSceneFishInstance(
    speciesId: string,
    swimLevel: SwimLevel,
    dimensions: TankDimensions,
    instanceIndex: number,
): TankSceneFishInstance {
    const bounds = getTankVolumeBounds(dimensions);
    const swimBand = getSwimBand(swimLevel, dimensions);

    return {
        id: createSceneFishId(speciesId, instanceIndex),
        speciesId,
        instanceIndex,
        x: randomBetween(bounds.xMin, bounds.xMax),
        y: randomBetween(swimBand.yMin, swimBand.yMax),
        z: randomBetween(bounds.zMin, bounds.zMax),
        scale: randomBetween(0.96, 1.04),
        speed: randomBetween(0.028, 0.072),
        direction: Math.random() > 0.5 ? 1 : -1,
        phase: randomBetween(0, 1),
    };
}

export function appendSceneFishInstance(
    sceneFish: TankSceneFishInstance[],
    speciesId: string,
    swimLevel: SwimLevel,
    dimensions: TankDimensions,
): TankSceneFishInstance[] {
    const instanceIndex = getNextInstanceIndex(sceneFish, speciesId);

    return [...sceneFish, createSceneFishInstance(speciesId, swimLevel, dimensions, instanceIndex)];
}

export function removeSceneFishInstances(
    sceneFish: TankSceneFishInstance[],
    speciesId: string,
    removeCount: number,
): TankSceneFishInstance[] {
    if (removeCount <= 0) {
        return sceneFish;
    }

    const removableIds = sceneFish
        .filter((entry) => entry.speciesId === speciesId)
        .sort((left, right) => right.instanceIndex - left.instanceIndex)
        .slice(0, removeCount)
        .map((entry) => entry.id);

    if (removableIds.length === 0) {
        return sceneFish;
    }

    const removableSet = new Set(removableIds);
    return sceneFish.filter((entry) => !removableSet.has(entry.id));
}

export function clampSceneFishToDimensions(
    instance: TankSceneFishInstance,
    swimLevel: SwimLevel,
    dimensions: TankDimensions,
): TankSceneFishInstance {
    const bounds = getTankVolumeBounds(dimensions);
    const swimBand = getSwimBand(swimLevel, dimensions);

    return {
        ...instance,
        x: clamp(instance.x, bounds.xMin, bounds.xMax),
        y: clamp(instance.y, swimBand.yMin, swimBand.yMax),
        z: clamp(instance.z, bounds.zMin, bounds.zMax),
    };
}

export function reconcileSceneFish(
    sceneFish: TankSceneFishInstance[],
    inventory: TankSpeciesDraft[],
    dimensions: TankDimensions,
): TankSceneFishInstance[] {
    const speciesMap = getSpeciesMap(inventory);

    let nextSceneFish = sceneFish.filter((entry) => speciesMap.has(entry.speciesId));

    inventory.forEach((item) => {
        const currentCount = nextSceneFish.filter((entry) => entry.speciesId === item.speciesId).length;
        const delta = item.quantity - currentCount;

        if (delta > 0) {
            for (let count = 0; count < delta; count += 1) {
                nextSceneFish = appendSceneFishInstance(nextSceneFish, item.speciesId, item.swimLevel, dimensions);
            }
        }

        if (delta < 0) {
            nextSceneFish = removeSceneFishInstances(nextSceneFish, item.speciesId, Math.abs(delta));
        }
    });

    return nextSceneFish.map((entry) => {
        const species = speciesMap.get(entry.speciesId);
        return species ? clampSceneFishToDimensions(entry, species.swimLevel, dimensions) : entry;
    });
}

export function resolveSceneFish(
    sceneFish: TankSceneFishInstance[],
    inventory: TankSpeciesDraft[],
): TankSceneFish[] {
    const speciesMap = getSpeciesMap(inventory);
    const resolvedFish: TankSceneFish[] = [];

    sceneFish.forEach((entry) => {
        const species = speciesMap.get(entry.speciesId);

        if (!species) {
            return;
        }

        resolvedFish.push({
            ...entry,
            commonName: species.commonName,
            scientificName: species.scientificName,
            thumbnailUrl: species.thumbnailUrl,
            adultSize: species.adultSize ?? FALLBACK_ADULT_SIZE_CM,
            swimLevel: species.swimLevel,
        });
    });

    return resolvedFish;
}

export function getTankRenderDimensions(dimensions: TankDimensions): TankRenderDimensions {
    const maxDimension = Math.max(dimensions.length, dimensions.width, dimensions.height, 1);
    const scaleFactor = MAX_RENDER_AXIS / maxDimension;

    return {
        length: dimensions.length * scaleFactor,
        width: dimensions.width * scaleFactor,
        height: dimensions.height * scaleFactor,
    };
}

export function getFishRenderScale(
    adultSize: number,
    dimensions: TankDimensions,
    variance = 1,
): number {
    const safeAdultSize = Math.max(1, adultSize || FALLBACK_ADULT_SIZE_CM);
    const safeTankLength = Math.max(dimensions.length, 20);
    const lengthRatio = safeAdultSize / safeTankLength;
    const baseScale = 0.42 + lengthRatio * 5.8;

    return clamp(baseScale * variance, 0.34, 2.2);
}

export function getAnimatedFishWorldPosition(
    fish: TankSceneFish,
    dimensions: TankDimensions,
    elapsedSeconds: number,
): AnimatedTankWorldPosition {
    const renderDimensions = getTankRenderDimensions(dimensions);
    const bounds = getTankVolumeBounds(dimensions);
    const swimBand = getSwimBand(fish.swimLevel, dimensions);

    const worldMinX = -renderDimensions.length / 2 + bounds.xMin * renderDimensions.length;
    const worldMaxX = -renderDimensions.length / 2 + bounds.xMax * renderDimensions.length;
    const worldMinY = -renderDimensions.height / 2 + swimBand.yMin * renderDimensions.height;
    const worldMaxY = -renderDimensions.height / 2 + swimBand.yMax * renderDimensions.height;
    const worldMinZ = -renderDimensions.width / 2 + bounds.zMin * renderDimensions.width;
    const worldMaxZ = -renderDimensions.width / 2 + bounds.zMax * renderDimensions.width;
    const centerX = -renderDimensions.length / 2 + fish.x * renderDimensions.length;
    const centerY = -renderDimensions.height / 2 + fish.y * renderDimensions.height;
    const centerZ = -renderDimensions.width / 2 + fish.z * renderDimensions.width;
    const xAmplitude = getAxisAmplitude(
        centerX,
        worldMinX,
        worldMaxX,
        renderDimensions.length * (0.08 + fish.phase * 0.08),
        0.06,
    );
    const yAmplitude = getAxisAmplitude(
        centerY,
        worldMinY,
        worldMaxY,
        renderDimensions.height * 0.11,
        0.015,
    );
    const zAmplitude = getAxisAmplitude(
        centerZ,
        worldMinZ,
        worldMaxZ,
        renderDimensions.width * (0.11 + fish.phase * 0.06),
        0.04,
    );

    const computePosition = (sampleSeconds: number): AnimatedTankWorldPosition => {
        const time = sampleSeconds * Math.max(fish.speed, 0.02) * Math.PI * 2;
        const xOffset =
            fish.direction *
            (
                Math.sin(time + fish.phase * Math.PI * 2) * xAmplitude +
                Math.sin(time * 0.47 + fish.phase * Math.PI * 3.2) * xAmplitude * 0.34 +
                getCompositeLateralOffset(sampleSeconds, fish.speed, fish.phase, fish.direction) * xAmplitude * 0.18
            );
        const yOffset =
            Math.sin(time * 0.66 + fish.phase * Math.PI * 2.7) * yAmplitude +
            Math.cos(time * 1.18 + fish.phase * Math.PI * 1.1) * yAmplitude * 0.28;
        const zOffset =
            Math.cos(time * 0.82 + fish.phase * Math.PI * 1.8) * zAmplitude +
            Math.sin(time * 1.29 + fish.phase * Math.PI * 4.3) * zAmplitude * 0.26;

        return {
            x: clamp(centerX + xOffset, worldMinX, worldMaxX),
            y: clamp(centerY + yOffset, worldMinY, worldMaxY),
            z: clamp(centerZ + zOffset, worldMinZ, worldMaxZ),
            facingDirection: 1,
            headingYaw: 0,
            pitch: 0,
            bank: 0,
        };
    };

    const current = computePosition(elapsedSeconds);
    const previous = computePosition(elapsedSeconds - 0.08);
    const deltaX = current.x - previous.x;
    const deltaY = current.y - previous.y;
    const deltaZ = current.z - previous.z;
    const horizontalSpeed = Math.max(Math.hypot(deltaX, deltaZ), 0.0001);
    const facingDirection = deltaX >= 0 ? 1 : -1;
    const headingYaw = Math.atan2(deltaZ, deltaX);
    const pitch = Math.atan2(deltaY, horizontalSpeed);
    const bank = clamp((deltaZ / horizontalSpeed) * 0.16, -0.2, 0.2);

    return {
        ...current,
        facingDirection,
        headingYaw,
        pitch,
        bank,
    };
}

export function projectSceneFishToFrontView(
    fish: TankSceneFish,
    dimensions: TankDimensions,
): TankSceneProjection {
    const renderDimensions = getTankRenderDimensions(dimensions);
    const depthPercent = fish.z * 100;

    return {
        leftPercent: fish.x * 100,
        topPercent: 100 - fish.y * 100,
        depthPercent:
            renderDimensions.width === 0
                ? depthPercent
                : clamp(depthPercent, 4, 96),
    };
}

export function getSceneFishRenderState(
    fish: TankSceneFish,
    dimensions: TankDimensions,
    elapsedSeconds: number,
): SceneFishRenderState {
    const animatedPosition = getAnimatedFishWorldPosition(fish, dimensions, elapsedSeconds);
    const renderDimensions = getTankRenderDimensions(dimensions);
    const projection = projectSceneFishToFrontView(fish, dimensions);

    return {
        projection: {
            ...projection,
            leftPercent:
                renderDimensions.length === 0
                    ? projection.leftPercent
                    : clamp(((animatedPosition.x / renderDimensions.length) + 0.5) * 100, 4, 96),
            topPercent:
                renderDimensions.height === 0
                    ? projection.topPercent
                    : clamp((0.5 - animatedPosition.y / renderDimensions.height) * 100, 4, 96),
            depthPercent:
                renderDimensions.width === 0
                    ? projection.depthPercent
                    : clamp(((animatedPosition.z / renderDimensions.width) + 0.5) * 100, 4, 96),
        },
        facingDirection: animatedPosition.facingDirection,
        bobOffsetPercent: Math.sin((elapsedSeconds * fish.speed * 4) + fish.phase * Math.PI * 2) * 0.45,
    };
}
