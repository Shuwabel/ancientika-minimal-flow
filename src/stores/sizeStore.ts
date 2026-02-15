import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  gender: string;
  height: number;
  heightUnit: "cm" | "in";
  weight: number;
  weightUnit: "kg" | "lbs";
  bodyShape: string;
  fitPreference: string;
}

interface SizeState {
  recommendations: Record<string, string>; // e.g. { tops: "M", bottoms: "L" }
  userProfile: UserProfile | null;
  setRecommendation: (category: string, size: string) => void;
  getRecommendation: (category: string) => string | null;
  clearRecommendation: (category: string) => void;
  setUserProfile: (profile: UserProfile) => void;
  clearAll: () => void;
}

export const useSizeStore = create<SizeState>()(
  persist(
    (set, get) => ({
      recommendations: {},
      userProfile: null,
      setRecommendation: (category, size) =>
        set((state) => ({
          recommendations: { ...state.recommendations, [category.toLowerCase()]: size },
        })),
      getRecommendation: (category) =>
        get().recommendations[category.toLowerCase()] || null,
      clearRecommendation: (category) =>
        set((state) => {
          const { [category.toLowerCase()]: _, ...rest } = state.recommendations;
          return { recommendations: rest };
        }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      clearAll: () => set({ recommendations: {}, userProfile: null }),
    }),
    { name: "size-storage" }
  )
);
