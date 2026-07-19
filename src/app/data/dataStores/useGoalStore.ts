import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '../DataStore/dataStorage';

interface GoalsState {
  dailyProteinTarget: number;
  dailyFiberTarget: number;
  dailyCaloriesTarget: number;
  setTargets: (targets: { protein: number; fiber: number; calories: number }) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      // Default baseline values (can be adjusted by the user later)
      dailyProteinTarget: 130,
      dailyFiberTarget: 30,
      dailyCaloriesTarget: 2000,
      
      setTargets: (targets) => set({
        dailyProteinTarget: targets.protein,
        dailyFiberTarget: targets.fiber,
        dailyCaloriesTarget: targets.calories,
      }),
    }),
    {
      // Unique key for the targets configuration slice inside the central MMKV store
      name: 'goals-app-state',
      storage: createJSONStorage(() => appStorage),
    }
  )
);