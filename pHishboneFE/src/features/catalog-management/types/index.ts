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
