import type { Database } from '#shared/types/database'

/** Typed Supabase client. */
export const useDb = () => useSupabaseClient<Database>()

/** Current user's id (the JWT `sub`), or null when signed out. */
export function useUserId() {
  const user = useSupabaseUser()
  return computed<string | null>(() => (user.value?.sub as string | undefined) ?? null)
}

/** Postgres/PostgREST errors carry a readable `message`; normalise anything else. */
export function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return 'Something went wrong'
}
