import { create } from 'zustand'
import type { Repository } from '@/types'

interface RepoState {
  repositories: Repository[]
  selectedRepo: Repository | null
  setRepositories: (repos: Repository[]) => void
  setSelectedRepo: (repo: Repository | null) => void
  updateRepo: (id: string, updates: Partial<Repository>) => void
}

export const useRepoStore = create<RepoState>((set) => ({
  repositories: [],
  selectedRepo: null,
  setRepositories: (repositories) => set({ repositories }),
  setSelectedRepo: (selectedRepo) => set({ selectedRepo }),
  updateRepo: (id, updates) =>
    set((state) => ({
      repositories: state.repositories.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
}))
