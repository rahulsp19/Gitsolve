import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  session: unknown | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: unknown) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setSession: (session) => set({ session }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
