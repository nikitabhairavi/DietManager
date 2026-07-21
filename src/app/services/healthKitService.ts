import AppleHealthKit, {
    HealthKitPermissions,
    HealthValue,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.Workout,
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
 * Fetch total active workout calories burned for a specific target date
 */
export const fetchActiveCaloriesForDate = (targetDate: Date): Promise<number> => {
  return new Promise((resolve) => {
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    AppleHealthKit.getActiveEnergyBurned(
      options,
      (err: Object, results: Array<HealthValue>) => {
        if (err || !results) {
          console.log('[HealthKit] Error fetching active calories:', err);
          resolve(0);
          return;
        }

        // Sum up active calories recorded across all Apple Watch samples for the day
        const totalBurned = results.reduce((sum, item) => sum + item.value, 0);
        resolve(Math.round(totalBurned));
      }
    );
  });
};