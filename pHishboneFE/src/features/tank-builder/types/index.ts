import type { SwimLevel, SpeciesDetailDto, SpeciesDto, WaterType } from '../../catalog-management/types';

export interface TankDimensions {
    length: number;
    width: number;
    height: number;
}

export type TankSceneViewMode = '3d' | '2d';

export interface TankSpeciesDraft {
    speciesId: string;
    slug: string;
    commonName: string;
    scientificName: string;
    thumbnailUrl?: string;
    adultSize: number;
    swimLevel: SwimLevel;
    quantity: number;
}

export interface GuestTankAnalysisItemRequest {
    speciesId: string;
    quantity: number;
}

export interface GuestTankAnalysisRequest {
    width: number;
    height: number;
    depth: number;
    items: GuestTankAnalysisItemRequest[];
}

export type TankMode = 'guest' | 'user';
export type TankStatus = 0 | 1 | 2;
export type TankItemType = 1 | 2;

export interface CreateTankPayload {
    name: string;
    width: number;
    height: number;
    depth: number;
    waterVolume: number;
    waterType: WaterType;
}

export interface UpdateTankPayload extends CreateTankPayload {
    status: TankStatus;
}

export interface TankListItemDto {
    id: string;
    name: string;
    waterVolume: number;
    waterType: WaterType;
    status: TankStatus;
    itemCount: number;
    createdTime: string;
}

export interface TankResponseDto {
    id: string;
    userId: string;
    name: string;
    width: number;
    height: number;
    depth: number;
    waterVolume: number;
    waterType: WaterType;
    status: TankStatus;
    itemCount: number;
    createdTime: string;
    lastUpdatedTime?: string | null;
}

export interface AddTankItemPayload {
    itemType: TankItemType;
    referenceId: string;
    quantity: number;
    note?: string;
}

export interface UpdateTankItemPayload {
    quantity: number;
    note?: string;
}

export interface TankItemResponseDto {
    id: string;
    tankId: string;
    itemType: TankItemType;
    referenceId: string;
    quantity: number;
    note?: string | null;
    createdTime: string;
}

export type AnalysisSeverity = 0 | 1 | 2 | 'Info' | 'Warning' | 'Danger';

export interface DecimalRangeDto {
    min: number;
    max: number;
}

export interface IntRangeDto {
    min: number;
    max: number;
}

export interface BioLoadItemDto {
    speciesId: string;
    speciesName: string;
    adultSize: number;
    bioLoadFactor: number;
    quantity: number;
    bioLoad: number;
}

export interface TankAlertDto {
    code: string;
    severity: AnalysisSeverity;
    message: string;
    speciesIds: string[];
    speciesNames: string[];
    tagIds: string[];
}

export interface TankAnalysisReportDto {
    volumeLiters: number;
    volumeGallons: number;
    requiredVolumeLiters: number;
    totalBioLoad: number;
    capacityPercentage: number;
    phRange: DecimalRangeDto | null;
    tempRange: IntRangeDto | null;
    bioLoadItems: BioLoadItemDto[];
    alerts: TankAlertDto[];
}

export interface TankSceneFishInstance {
    id: string;
    speciesId: string;
    instanceIndex: number;
    x: number;
    y: number;
    z: number;
    scale: number;
    speed: number;
    direction: -1 | 1;
    phase: number;
}

export interface TankSceneFish extends TankSceneFishInstance {
    commonName: string;
    scientificName: string;
    thumbnailUrl?: string;
    adultSize: number;
    swimLevel: SwimLevel;
}

export interface TankSceneProjection {
    leftPercent: number;
    topPercent: number;
    depthPercent: number;
}

export interface TankRenderDimensions {
    length: number;
    width: number;
    height: number;
}

export interface TankVolumeBounds {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
}

export interface TankSwimBand {
    yMin: number;
    yMax: number;
}

export interface TankWorldPosition {
    x: number;
    y: number;
    z: number;
}

export interface AnimatedTankWorldPosition extends TankWorldPosition {
    facingDirection: -1 | 1;
    headingYaw: number;
    pitch: number;
    bank: number;
}

export interface SceneFishRenderState {
    projection: TankSceneProjection;
    facingDirection: -1 | 1;
    bobOffsetPercent: number;
}

export interface TankSceneFishSpriteProps {
    fish: TankSceneFish;
    isSelected: boolean;
    onSelect: (speciesId: string) => void;
}

export interface TankSceneDimensionsProps {
    dimensions: TankDimensions;
    onSetDimensions: (dimensions: Partial<TankDimensions>) => void;
}

export interface TankSceneToolbarProps {
    viewMode: TankSceneViewMode;
    volumeLiters: number;
    onChangeViewMode: (viewMode: TankSceneViewMode) => void;
}

export interface TankSceneViewportProps {
    dimensions: TankDimensions;
    fish: TankSceneFish[];
    selectedSpeciesId: string | null;
    onSelectSpecies: (speciesId: string | null) => void;
}

export interface BuilderSceneViewportProps extends TankSceneViewportProps {
    isDropActive: boolean;
}

export interface TankSceneLayoutProps extends TankSceneDimensionsProps {
    fish: TankSceneFish[];
    selectedSpeciesId: string | null;
    viewMode: TankSceneViewMode;
    onChangeViewMode: (viewMode: TankSceneViewMode) => void;
    onSelectSpecies: (speciesId: string | null) => void;
    volumeLiters: number;
}

export interface TankSceneFishMotionSample {
    commonName: string;
    projection: TankSceneProjection;
    scale: number;
    facingDirection: -1 | 1;
}

export function buildTankDraft(species: SpeciesDto, detail: SpeciesDetailDto): TankSpeciesDraft {
    return {
        speciesId: species.id,
        slug: species.slug,
        commonName: species.commonName,
        scientificName: species.scientificName,
        thumbnailUrl: species.thumbnailUrl,
        adultSize: detail.profile?.adultSize ?? 6,
        swimLevel: detail.profile?.swimLevel ?? 3,
        quantity: 1,
    };
}

export function buildTankDraftFromDetail(detail: SpeciesDetailDto, quantity = 1): TankSpeciesDraft {
    return {
        speciesId: detail.id,
        slug: detail.slug,
        commonName: detail.commonName,
        scientificName: detail.scientificName,
        thumbnailUrl: detail.thumbnailUrl,
        adultSize: detail.profile?.adultSize ?? 6,
        swimLevel: detail.profile?.swimLevel ?? 3,
        quantity,
    };
}
