// ─── Enums (mirror Domain.Enums on the backend) ─────────────────────────────

export type WaterType = 0 | 1 | 2; // Fresh = 0, Brackish = 1, Salt = 2
export const WaterTypeLabels: Record<WaterType, string> = {
    0: 'Fresh',
    1: 'Brackish',
    2: 'Salt',
};

export type SwimLevel = 0 | 1 | 2 | 3; // Top = 0, Middle = 1, Bottom = 2, All = 3
export const SwimLevelLabels: Record<SwimLevel, string> = {
    0: 'Top',
    1: 'Middle',
    2: 'Bottom',
    3: 'All',
};

export type DietType = 0 | 1 | 2; // Carnivore = 0, Herbivore = 1, Omnivore = 2
export const DietTypeLabels: Record<DietType, string> = {
    0: 'Carnivore',
    1: 'Herbivore',
    2: 'Omnivore',
};

export type CompatibilitySeverity = 0 | 1 | 2; // Info = 0, Warning = 1, Danger = 2
export const CompatibilitySeverityLabels: Record<CompatibilitySeverity, string> = {
    0: 'Info',
    1: 'Warning',
    2: 'Danger',
};

// ─── Common ──────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export interface PaginationResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// ─── Tag DTOs ────────────────────────────────────────────────────────────────

export interface TagDto {
    id: string;
    code: string;
    name: string;
    description?: string;
    createdTime: string;
}

export interface CreateTagPayload {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateTagPayload {
    code: string;
    name: string;
    description?: string;
}

export interface TagFilter {
    page?: number;
    size?: number;
    searchTerm?: string;
    sortBy?: string;
    isAscending?: boolean;
}

// ─── Type DTOs ───────────────────────────────────────────────────────────────

export interface SpeciesTypeDto {
    id: string;
    name: string;
    description?: string;
    createdTime: string;
}

export interface CreateTypePayload {
    name: string;
    description?: string;
}

export interface UpdateTypePayload {
    name: string;
    description?: string;
}

export interface TypeFilter {
    page?: number;
    size?: number;
    searchTerm?: string;
    sortBy?: string;
    isAscending?: boolean;
}

// ─── Species DTOs ─────────────────────────────────────────────────────────────

export interface SpeciesDto {
    id: string;
    typeId: string;
    typeName: string;
    scientificName: string;
    commonName: string;
    thumbnailUrl?: string;
    slug: string;
    createdTime: string;
}

export interface SpeciesEnvironmentDto {
    phMin: number;
    phMax: number;
    tempMin: number;
    tempMax: number;
    minTankVolume: number;
    waterType: WaterType;
}

export interface SpeciesProfileDto {
    adultSize: number;
    bioLoadFactor: number;
    swimLevel: SwimLevel;
    dietType: DietType;
    preferredFood?: string;
    isSchooling: boolean;
    minGroupSize: number;
    origin?: string;
    description?: string;
}

export interface SpeciesDetailDto extends SpeciesDto {
    lastUpdatedTime?: string;
    environment?: SpeciesEnvironmentDto;
    profile?: SpeciesProfileDto;
    tags: TagDto[];
}

export interface SpeciesFilter {
    page?: number;
    size?: number;
    searchTerm?: string;
    typeId?: string;
    sortBy?: string;
    isAscending?: boolean;
}

// ─── Create / Update Species Payloads ────────────────────────────────────────

export interface SpeciesEnvironmentPayload {
    phMin: number;
    phMax: number;
    tempMin: number;
    tempMax: number;
    minTankVolume: number;
    waterType: WaterType;
}

export interface SpeciesProfilePayload {
    adultSize: number;
    bioLoadFactor: number;
    swimLevel: SwimLevel;
    dietType: DietType;
    preferredFood?: string;
    isSchooling: boolean;
    minGroupSize: number;
    origin?: string;
    description?: string;
}

export interface CreateSpeciesPayload {
    commonName: string;
    scientificName: string;
    typeId: string;
    thumbnailUrl?: string;
    environment: SpeciesEnvironmentPayload;
    profile: SpeciesProfilePayload;
    tagIds: string[];
}

export interface UpdateSpeciesPayload {
    commonName: string;
    scientificName: string;
    typeId: string;
    thumbnailUrl?: string;
    environment: SpeciesEnvironmentPayload;
    profile: SpeciesProfilePayload;
    tagIds: string[];
}

export interface GenerateFishInformationPayload {
    fishName: string;
    modelConfigId?: string;
}

export interface AiGeneratedSpeciesDraftEnvironmentDto {
    phMin: number;
    phMax: number;
    tempMin: number;
    tempMax: number;
    minTankVolume: number;
    waterType: WaterType;
    waterTypeName: string;
}

export interface AiGeneratedSpeciesDraftProfileDto {
    adultSize: number;
    bioLoadFactor: number;
    swimLevel: SwimLevel;
    swimLevelName: string;
    dietType: DietType;
    dietTypeName: string;
    preferredFood?: string | null;
    isSchooling: boolean;
    minGroupSize: number;
    origin?: string | null;
    description?: string | null;
}

export interface AiGeneratedSpeciesDraftDto {
    commonName: string;
    scientificName: string;
    typeId: string;
    typeName: string;
    thumbnailUrl?: string | null;
    environment: AiGeneratedSpeciesDraftEnvironmentDto;
    profile: AiGeneratedSpeciesDraftProfileDto;
    tagIds: string[];
    tagCodes: string[];
}

export interface AiFishInformationResponseDto {
    modelConfigId: string;
    promptTemplateId?: string | null;
    existingSpecies?: SpeciesDetailDto | null;
    generatedDraft?: AiGeneratedSpeciesDraftDto | null;
}

// ─── Form shape (used by react-hook-form) ────────────────────────────────────

export interface SpeciesFormValues {
    // Taxonomy tab
    commonName: string;
    scientificName: string;
    typeId: string;
    thumbnailUrl: string;
    // Bio tab (environment)
    phMin: number;
    phMax: number;
    tempMin: number;
    tempMax: number;
    minTankVolume: number;
    waterType: WaterType;
    // Bio tab (profile)
    adultSize: number;
    bioLoadFactor: number;
    // Behavior tab
    swimLevel: SwimLevel;
    dietType: DietType;
    preferredFood: string;
    isSchooling: boolean;
    minGroupSize: number;
    origin: string;
    description: string;
    // Indexing tab
    tagIds: string[];
}

// ─── Image DTOs ──────────────────────────────────────────────────────────────

export interface ImageResponseDto {
    id: string;
    imageUrl: string;
    publicId?: string;
    caption?: string;
    sortOrder: number;
    createdTime: string;
}

// ─── Compatibility Rule DTOs ─────────────────────────────────────────────────

export interface CompatibilityRuleDto {
    id: string;
    subjectTagId: string;
    subjectTagName: string;
    objectTagId: string;
    objectTagName: string;
    severity: string;
    message: string;
    createdTime: string;
}

export interface CompatibilityRuleFilter {
    page?: number;
    size?: number;
    searchTerm?: string;
    sortBy?: string;
    isAscending?: boolean;
}

export interface CreateCompatibilityRulePayload {
    subjectTagId: string;
    objectTagId: string;
    severity: CompatibilitySeverity;
    message: string;
}

export interface UpdateCompatibilityRulePayload {
    severity: CompatibilitySeverity;
    message: string;
}
