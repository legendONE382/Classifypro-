const getEnv = (value: string | undefined, fallback: string): string => {
  if (!value || value.trim().length === 0) {
    return fallback;
  }
  return value;
};

const getEnvNumber = (value: string | undefined, fallback: number): number => {
  if (!value || value.trim().length === 0) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

export const env = {
  supabaseUrl: getEnv(process.env.EXPO_PUBLIC_SUPABASE_URL, "https://example.supabase.co"),
  supabaseAnonKey: getEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, "public-anon-key"),
  schoolLatitude: getEnvNumber(process.env.EXPO_PUBLIC_SCHOOL_LAT, 6.9271),
  schoolLongitude: getEnvNumber(process.env.EXPO_PUBLIC_SCHOOL_LON, 3.3955),
  geofenceRadiusMeters: getEnvNumber(process.env.EXPO_PUBLIC_GEOFENCE_RADIUS, 100),
} as const;

export default env;
