export function isSimpleMode(): boolean {
  return (
    process.env.SIMPLE_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getDataDir(): string {
  return process.env.SIMPLE_DATA_DIR || (process.env.VERCEL ? '/tmp/afya' : '.afya-data');
}

