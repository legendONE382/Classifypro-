const getEnv = (value: string | undefined, fallback: string): string => {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
};

export const env = {
  supabaseUrl: getEnv(process.env.EXPO_PUBLIC_SUPABASE_URL, "https://example.supabase.co"),
  supabaseAnonKey: getEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, "public-anon-key")
};
