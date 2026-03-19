import type { SpeciesDto } from '../../catalog-management/types';

export interface TankDimensions {
    length: number;
    width: number;
    height: number;
}

export interface TankItem {
    speciesId: string;
    quantity: number;
    species: SpeciesDto;
}

export interface TankSnapshotRequest {
    volumeLiters: number;
    items: {
        speciesId: string;
        quantity: number;
    }[];
}

export interface EnvironmentRangeOverlap {
    phMin: number;
    phMax: number;
    tempMin: number;
    tempMax: number;
    hasOverlap: boolean;
}

export interface CompatibilityAlert {
    severity: 'error' | 'warning' | 'info';
    message: string;
    subjectSpeciesId?: string;
    objectSpeciesId?: string;
}

export interface TankAnalysisResult {
    totalBioLoadFactor: number;
    capacityPercentage: number;
    environmentOverlap: EnvironmentRangeOverlap;
    alerts: CompatibilityAlert[];
}
