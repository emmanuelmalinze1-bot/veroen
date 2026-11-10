import { useEffect, useState } from 'react'

import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { Bell, ChevronLeft, Clock } from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'

const UserNotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      const data = all.filter(
        (n) => !n.targetEmail || n.targetEmail === user?.email
      )
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setNotifications(data)
      setLoading(false)

      if (user?.uid && data.length > 0) {
        const ids = data.map((n) => n.id)
        updateDoc(doc(db, 'users', user.uid), {
          readNotifications: arrayUnion(...ids),
        }).catch((err) => console.error(err))
      }
    })
    return () => unsub()
  }, [user])

  const formatDate = (ts: any) => {
    if (!ts) return 'Just now'
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return date.toLocaleString()
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F4F7FE] font-sans">
      <Metadata title="Notifications — VIREON" />

      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#E2E8F5] bg-white p-4">
        <button
          onClick={() => navigate(routes.home())}
          className="rounded-full p-1 hover:bg-[#F4F7FE]"
        >
          <ChevronLeft className="h-6 w-6 text-[#0A1A3C]" />
        </button>
        <h1 className="text-lg font-bold text-[#0A1A3C]">Notifications</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-[#E2E8F5] bg-white p-4"
              >
                <div className="anim-shimmer h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="anim-shimmer h-4 w-1/2 rounded" />
                  <div className="anim-shimmer h-3 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="anim-pop-in rounded-2xl bg-white p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-[#CBD5E1]" />
            <p className="mt-3 text-sm text-[#64748B]">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, index) => (
              <div
                key={n.id}
                className="anim-fade-up rounded-2xl border border-[#E2E8F5] bg-white p-4"
                style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F1FF]">
                    <Bell className="h-5 w-5 text-[#2F80ED]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#0A1A3C]">{n.title}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[#64748B]">
                      {n.body}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-[10px] text-[#94A3B8]">
                      <Clock className="h-3 w-3" /> {formatDate(n.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserNotificationsPage
