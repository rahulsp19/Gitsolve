import React, { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore, AppNotification } from '@/stores/notificationStore'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const { fetchNotifications, addNotification } = useNotificationStore()

  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchNotifications()

    // Subscribe to real-time inserts
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as AppNotification
          addNotification(newNotif)
          
          // Show Toast
          toast(newNotif.message, {
            description: new Date(newNotif.created_at).toLocaleTimeString(),
            action: {
              label: 'View',
              onClick: () => {
                // You could route to the specific repo or issue based on metadata
              }
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchNotifications, addNotification])

  return (
    <>
      {children}
      <Toaster theme="dark" position="bottom-right" />
    </>
  )
}
