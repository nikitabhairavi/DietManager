import { appStorage } from '@/data/storage/dataStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface RewardsState {
  pointsEarned: number;
  pointsSpent: number;
  lastResetMonth: string;
  syncPoints: (earned: number, currentMonth: string) => void;
  redeemPoints: (amount: number) => boolean;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      pointsEarned: 0,
      pointsSpent: 0,
      lastResetMonth: new Date().toISOString().slice(0, 7),

      syncPoints: (earned, currentMonth) => {
        const isNewMonth = currentMonth !== get().lastResetMonth;
        
        if (isNewMonth) {
          set({
            pointsEarned: earned,
            pointsSpent: 0,
            lastResetMonth: currentMonth,
          });
        } else {
          set({ pointsEarned: earned });
        }
      },

      redeemPoints: (amount) => {
        const currentBalance = Math.max(0, get().pointsEarned - get().pointsSpent);
        if (currentBalance >= amount) {
          set((state) => ({ pointsSpent: state.pointsSpent + amount }));
          return true;
        }
        return false;
      },
    }),
    {
      name: 'diet-manager-rewards-storage',
      storage: createJSONStorage(() => appStorage),
    }
  )
);