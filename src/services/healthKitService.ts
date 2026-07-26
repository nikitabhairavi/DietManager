import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.Steps,
    ],
    write: [],
  },
};

/**
 * Request HealthKit permissions
 */
export const initHealthKit = (): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log('[HealthKit] Initializing...');
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log('[HealthKit] Authorization failed:', error);
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

/**
 * Helper to produce accurate local start and end dates for HealthKit queries
 */
const getDayBounds = (targetDate: Date) => {
  const start = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    0,
    0,
    0,
    0
  );

  const end = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    23,
    59,
    59,
    999
  );

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

/**
 * Fetch total steps for a specific historical target date using sample logs
 */
export const fetchStepsForDate = (date: Date): Promise<number> => {
  return new Promise((resolve) => {
    const { startDate, endDate } = getDayBounds(date);

    const options = {
      startDate,
      endDate,
    };

    AppleHealthKit.getDailyStepCountSamples(
      options,
      (err: string, results: Array<HealthValue>) => {
        if (err || !results || results.length === 0) {
          // Default directly to 0 if no samples exist for this date
          resolve(0);
          return;
        }

        // Sum step counts returned in the daily samples array
        const totalSteps = results.reduce((sum, item) => sum + (item.value || 0), 0);
        resolve(Math.round(totalSteps));
      }
    );
  });
};
/**
 * Fetch total active workout calories burned for a specific target date
 */
export const fetchActiveCaloriesForDate = (targetDate: Date): Promise<number> => {
  return new Promise((resolve) => {
    const { startDate, endDate } = getDayBounds(targetDate);

    const options = {
      startDate,
      endDate,
    };

    AppleHealthKit.getActiveEnergyBurned(
      options,
      (err: string, results: Array<HealthValue>) => {
        if (err || !results) {
          console.log('[HealthKit] Error fetching active calories:', err);
          resolve(0);
          return;
        }

        const totalBurned = results.reduce((sum, item) => sum + item.value, 0);
        resolve(Math.round(totalBurned));
      }
    );
  });
};