import { useEffect, useState } from 'react'

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { db } from 'src/lib/firebase'

const formatDate = (ts: any) => {
  if (!ts) return 'Just now'
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return isNaN(date.getTime()) ? 'Just now' : date.toLocaleString()
}

const AdminNotificationsPage = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setNotifications(data)
    })
    return () => unsub()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSending(true)
    try {
      if (editingId) {
        await updateDoc(doc(db, 'notifications', editingId), {
          title: title.trim(),
          body: body.trim(),
        })
        setEditingId(null)
      } else {
        await addDoc(collection(db, 'notifications'), {
          title: title.trim(),
          body: body.trim(),
          createdAt: serverTimestamp(),
        })
      }
      setTitle('')
      setBody('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleEdit = (n: any) => {
    setEditingId(n.id)
    setTitle(n.title || '')
    setBody(n.body || '')
    setOpenMenuId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notification?')) return
    try {
      await deleteDoc(doc(db, 'notifications', id))
      setOpenMenuId(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans">
      <Metadata title="Admin Notifications — VIREON" />

      <header className="bg-[#0A1A3C] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate(routes.admin())}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black">Notifications</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-fit rounded-2xl bg-[#0A1A3C] p-6 text-white">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
              <Bell className="h-5 w-5" />
              {editingId ? 'Edit notification' : 'Send notification'}
            </h2>
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-white p-3 text-[#2F80ED]">
                <CheckCircle2 className="h-5 w-5" /> Sent
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2 text-sm text-[#0A1A3C]"
              />
              <textarea
                placeholder="Type your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                required
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2 text-sm text-[#0A1A3C]"
              />
              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-black text-[#0A1A3C] hover:bg-[#E8F1FF] disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : editingId ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {sending
                  ? 'Saving...'
                  : editingId
                    ? 'Update'
                    : 'Send to all users'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setTitle('')
                    setBody('')
                  }}
                  className="w-full rounded-lg bg-[#07132B] py-3 text-sm font-bold text-white hover:bg-[#12306B]"
                >
                  Cancel edit
                </button>
              )}
            </form>
          </div>

          <div className="rounded-2xl border border-[#E2E8F5] bg-white p-6 lg:col-span-2">
            <h2 className="mb-4 text-xl font-black text-[#0A1A3C]">
              Sent notifications ({notifications.length})
            </h2>
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#94A3B8]">
                No notifications sent yet.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="relative rounded-xl border border-[#E2E8F5] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0A1A3C]">{n.title}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[#64748B]">
                          {n.body}
                        </p>
                        <p className="mt-2 text-xs text-[#94A3B8]">
                          {formatDate(n.createdAt)}
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === n.id ? null : n.id)
                          }
                          className="rounded-full p-2 text-[#94A3B8] hover:bg-[#E8F1FF]"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {openMenuId === n.id && (
                          <div className="absolute right-0 top-8 z-10 w-32 rounded-lg border border-[#E2E8F5] bg-white p-1 shadow-lg">
                            <button
                              onClick={() => handleEdit(n)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-[#0A1A3C] hover:bg-[#E8F1FF]"
                            >
                              <Pencil className="h-4 w-4 text-[#2F80ED]" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(n.id)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminNotificationsPage
