import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'

export interface AppNotification {
  id: string
  user_id: string
  repo_name: string
  event_type: string
  message: string
  metadata: any
  read_status: boolean
  created_at: string
}

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  addNotification: (notification: AppNotification) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      const unreadCount = data.filter(n => !n.read_status).length
      set({ notifications: data, unreadCount, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  markAsRead: async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_status: true })
      .eq('id', id)

    if (!error) {
      const updated = get().notifications.map(n => n.id === id ? { ...n, read_status: true } : n)
      const unreadCount = updated.filter(n => !n.read_status).length
      set({ notifications: updated, unreadCount })
    }
  },

  markAllAsRead: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ read_status: true })
      .eq('user_id', user.id)
      .eq('read_status', false)

    if (!error) {
      const updated = get().notifications.map(n => ({ ...n, read_status: true }))
      set({ notifications: updated, unreadCount: 0 })
    }
  },

  addNotification: (notification: AppNotification) => {
    const current = get().notifications
    // prevent duplicates
    if (current.find(n => n.id === notification.id)) return
    
    const updated = [notification, ...current].slice(0, 50)
    const unreadCount = updated.filter(n => !n.read_status).length
    set({ notifications: updated, unreadCount })
  }
}))
