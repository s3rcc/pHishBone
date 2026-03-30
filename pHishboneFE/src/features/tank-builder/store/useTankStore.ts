import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    appendSceneFishInstance,
    clampSceneFishToDimensions,
    reconcileSceneFish,
    removeSceneFishInstances,
} from '../helpers/scene';
import type {
    TankDimensions,
    TankSceneFishInstance,
    TankSceneViewMode,
    TankSpeciesDraft,
} from '../types';

interface TankStoreState {
    dimensions: TankDimensions;
    inventory: TankSpeciesDraft[];
    sceneFish: TankSceneFishInstance[];
    viewMode: TankSceneViewMode;
    showSceneBubbles: boolean;
    selectedSpeciesId: string | null;
    getVolumeLiters: () => number;
    setDimensions: (dimensions: Partial<TankDimensions>) => void;
    upsertSpecies: (item: TankSpeciesDraft) => void;
    incrementSpecies: (speciesId: string) => void;
    decrementSpecies: (speciesId: string) => void;
    removeSpecies: (speciesId: string) => void;
    selectSpecies: (speciesId: string | null) => void;
    setViewMode: (viewMode: TankSceneViewMode) => void;
    setShowSceneBubbles: (showSceneBubbles: boolean) => void;
    syncSceneFish: () => void;
    clearDraft: () => void;
}

const DEFAULT_DIMENSIONS: TankDimensions = {
    length: 90,
    width: 45,
    height: 45,
};

const DEFAULT_STATE = {
    dimensions: DEFAULT_DIMENSIONS,
    inventory: [] as TankSpeciesDraft[],
    sceneFish: [] as TankSceneFishInstance[],
    viewMode: '3d' as TankSceneViewMode,
    showSceneBubbles: true,
    selectedSpeciesId: null as string | null,
};

export const useTankStore = create<TankStoreState>()(
    persist(
        (set, get) => ({
            ...DEFAULT_STATE,
            getVolumeLiters: () => {
                const { length, width, height } = get().dimensions;
                return (length * width * height) / 1000;
            },
            setDimensions: (nextDimensions) =>
                set((state) => ({
                    ...(() => {
                        const dimensions = {
                            ...state.dimensions,
                            ...nextDimensions,
                        };

                        return {
                            dimensions,
                            sceneFish: state.sceneFish.map((entry) => {
                                const species = state.inventory.find((item) => item.speciesId === entry.speciesId);

                                return species
                                    ? clampSceneFishToDimensions(entry, species.swimLevel, dimensions)
                                    : entry;
                            }),
                        };
                    })(),
                })),
            upsertSpecies: (item) =>
                set((state) => {
                    const existing = state.inventory.find((entry) => entry.speciesId === item.speciesId);

                    if (existing) {
                        return {
                            inventory: state.inventory.map((entry) =>
                                entry.speciesId === item.speciesId
                                    ? { ...entry, quantity: entry.quantity + 1 }
                                    : entry,
                            ),
                            sceneFish: appendSceneFishInstance(
                                state.sceneFish,
                                item.speciesId,
                                item.swimLevel,
                                state.dimensions,
                            ),
                            selectedSpeciesId: item.speciesId,
                        };
                    }

                    return {
                        inventory: [...state.inventory, item],
                        sceneFish: appendSceneFishInstance(
                            state.sceneFish,
                            item.speciesId,
                            item.swimLevel,
                            state.dimensions,
                        ),
                        selectedSpeciesId: item.speciesId,
                    };
                }),
            incrementSpecies: (speciesId) =>
                set((state) => {
                    const species = state.inventory.find((entry) => entry.speciesId === speciesId);

                    if (!species) {
                        return state;
                    }

                    return {
                        inventory: state.inventory.map((entry) =>
                            entry.speciesId === speciesId
                                ? { ...entry, quantity: entry.quantity + 1 }
                                : entry,
                        ),
                        sceneFish: appendSceneFishInstance(
                            state.sceneFish,
                            speciesId,
                            species.swimLevel,
                            state.dimensions,
                        ),
                        selectedSpeciesId: speciesId,
                    };
                }),
            decrementSpecies: (speciesId) =>
                set((state) => {
                    const nextInventory = state.inventory
                        .map((entry) =>
                            entry.speciesId === speciesId
                                ? { ...entry, quantity: entry.quantity - 1 }
                                : entry,
                        )
                        .filter((entry) => entry.quantity > 0);

                    return {
                        inventory: nextInventory,
                        sceneFish: removeSceneFishInstances(state.sceneFish, speciesId, 1),
                        selectedSpeciesId:
                            state.selectedSpeciesId === speciesId && !nextInventory.some((entry) => entry.speciesId === speciesId)
                                ? null
                                : state.selectedSpeciesId,
                    };
                }),
            removeSpecies: (speciesId) =>
                set((state) => ({
                    inventory: state.inventory.filter((entry) => entry.speciesId !== speciesId),
                    sceneFish: state.sceneFish.filter((entry) => entry.speciesId !== speciesId),
                    selectedSpeciesId: state.selectedSpeciesId === speciesId ? null : state.selectedSpeciesId,
                })),
            selectSpecies: (speciesId) =>
                set({
                    selectedSpeciesId: speciesId,
                }),
            setViewMode: (viewMode) =>
                set({
                    viewMode,
                }),
            setShowSceneBubbles: (showSceneBubbles) =>
                set({
                    showSceneBubbles,
                }),
            syncSceneFish: () =>
                set((state) => ({
                    sceneFish: reconcileSceneFish(state.sceneFish, state.inventory, state.dimensions),
                })),
            clearDraft: () =>
                set({
                    ...DEFAULT_STATE,
                }),
        }),
        {
            name: 'phishbone-guest-tank-draft',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                dimensions: state.dimensions,
                inventory: state.inventory,
                sceneFish: state.sceneFish,
                viewMode: state.viewMode,
                showSceneBubbles: state.showSceneBubbles,
            }),
        },
    ),
);
