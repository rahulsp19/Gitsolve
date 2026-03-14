import { create } from 'zustand'
import type { AgentRun, AgentStep } from '@/types'

interface AgentState {
  activeRun: AgentRun | null
  steps: AgentStep[]
  runs: AgentRun[]
  setActiveRun: (run: AgentRun | null) => void
  setSteps: (steps: AgentStep[]) => void
  updateStep: (stepId: string, updates: Partial<AgentStep>) => void
  addRun: (run: AgentRun) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  activeRun: null,
  steps: [],
  runs: [],
  setActiveRun: (activeRun) => set({ activeRun }),
  setSteps: (steps) => set({ steps }),
  updateStep: (stepId, updates) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      ),
    })),
  addRun: (run) =>
    set((state) => ({ runs: [run, ...state.runs] })),
}))
