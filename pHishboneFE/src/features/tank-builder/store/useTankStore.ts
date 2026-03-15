import { create } from 'zustand';
import type { TankDimensions, TankItem } from '../types';
import type { SpeciesDto } from '../../catalog-management/types';

interface TankStoreState {
    dimensions: TankDimensions;
    items: TankItem[];
    
    // Derived value
    getVolumeLiters: () => number;

    // Actions
    setDimensions: (dimensions: Partial<TankDimensions>) => void;
    addSpecies: (species: SpeciesDto, defaultQuantity?: number) => void;
    removeSpecies: (speciesId: string) => void;
    updateQuantity: (speciesId: string, quantity: number) => void;
    resetTank: () => void;
}

const DEFAULT_DIMENSIONS: TankDimensions = {
    length: 100,
    width: 50,
    height: 50,
};

export const useTankStore = create<TankStoreState>((set, get) => ({
    dimensions: DEFAULT_DIMENSIONS,
    items: [],

    getVolumeLiters: () => {
        const { length, width, height } = get().dimensions;
        // cm^3 to Liters = divide by 1000
        return (length * width * height) / 1000;
    },

    setDimensions: (newDimensions) =>
        set((state) => ({
            dimensions: { ...state.dimensions, ...newDimensions },
        })),

    addSpecies: (species, defaultQuantity = 1) =>
        set((state) => {
            const existing = state.items.find((i) => i.speciesId === species.id);
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.speciesId === species.id
                            ? { ...i, quantity: i.quantity + defaultQuantity }
                            : i,
                    ),
                };
            }
            return {
                items: [...state.items, { speciesId: species.id, quantity: defaultQuantity, species }],
            };
        }),

    removeSpecies: (speciesId) =>
        set((state) => ({
            items: state.items.filter((i) => i.speciesId !== speciesId),
        })),

    updateQuantity: (speciesId, quantity) =>
        set((state) => {
            if (quantity <= 0) {
                return {
                    items: state.items.filter((i) => i.speciesId !== speciesId),
                };
            }
            return {
                items: state.items.map((i) =>
                    i.speciesId === speciesId ? { ...i, quantity } : i,
                ),
            };
        }),

    resetTank: () => set({ dimensions: DEFAULT_DIMENSIONS, items: [] }),
}));
