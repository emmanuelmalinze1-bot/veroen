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
  CheckCircle2,
  ListChecks,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { db } from 'src/lib/firebase'
import { formatAmountInput, parseAmountInput } from 'src/lib/format'

const CATEGORIES = [
  'CallCash',
  'Converse',
  'Surveys',
  'IQ Tasks',
  'Streak',
  'EasyOwn',
  'Other',
]

const emptyForm = {
  moduleName: '',
  description: '',
  pay: '',
  category: 'CallCash',
  active: true,
}

const AdminTasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([])
  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setTasks(data)
    })
    return () => unsub()
  }, [])

  const handleEdit = (task: any) => {
    setEditingId(task.id)
    setForm({
      moduleName: task.moduleName || '',
      description: task.description || '',
      pay: formatAmountInput(String(task.pay || '')),
      category: task.category || 'CallCash',
      active: task.active !== false,
    })
    setOpenMenuId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task module?')) return
    try {
      await deleteDoc(doc(db, 'tasks', id))
      setOpenMenuId(null)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.moduleName || !form.pay) return
    setSaving(true)
    try {
      const payload = {
        moduleName: form.moduleName,
        description: form.description,
        pay: parseAmountInput(form.pay),
        category: form.category,
        active: form.active,
      }
      if (editingId) {
        await updateDoc(doc(db, 'tasks', editingId), payload)
        setEditingId(null)
      } else {
        await addDoc(collection(db, 'tasks'), {
          ...payload,
          createdAt: serverTimestamp(),
        })
      }
      setForm({ ...emptyForm })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans">
      <Metadata title="Admin Tasks — VIREON" />

      <header className="bg-[#0A1A3C] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate(routes.admin())}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black">Task Modules</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="order-2 rounded-2xl border border-[#E2E8F5] bg-white p-6 lg:order-1 lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0A1A3C]">
              <ListChecks className="h-5 w-5 text-[#2F80ED]" /> All modules (
              {tasks.length})
            </h2>
            {tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#94A3B8]">
                No task modules yet. Add your first one.
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="relative flex items-center gap-4 rounded-xl border border-[#E2E8F5] p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FF] text-[#2F80ED]">
                      <ListChecks className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0A1A3C]">
                        {task.moduleName}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {task.category} ·{' '}
                        {task.active === false ? 'Inactive' : 'Active'}
                      </p>
                      <p className="text-sm font-black text-[#2F80ED]">
                        ₦{Number(task.pay || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === task.id ? null : task.id)
                        }
                        className="rounded-full p-2 text-[#94A3B8] hover:bg-[#E8F1FF] hover:text-[#2F80ED]"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {openMenuId === task.id && (
                        <div className="absolute right-0 top-10 z-10 w-32 rounded-lg border border-[#E2E8F5] bg-white p-1 shadow-lg">
                          <button
                            onClick={() => handleEdit(task)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-[#0A1A3C] hover:bg-[#E8F1FF]"
                          >
                            <Pencil className="h-4 w-4 text-[#2F80ED]" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="order-1 h-fit rounded-2xl bg-[#0A1A3C] p-6 text-white lg:order-2">
            <h2 className="mb-1 text-xl font-black">
              {editingId ? 'Edit module' : 'Add module'}
            </h2>
            <p className="mb-4 text-xs leading-relaxed text-white/60">
              Uploaded modules appear for every user right away. Non-activated
              users can browse them but cannot start until they activate.
            </p>
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-white p-3 text-[#2F80ED]">
                <CheckCircle2 className="h-5 w-5" /> Saved
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Module name"
                value={form.moduleName}
                onChange={(e) =>
                  setForm({ ...form, moduleName: e.target.value })
                }
                required
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2 text-sm text-[#0A1A3C]"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Pay (₦) e.g. 10,000"
                value={form.pay}
                onChange={(e) =>
                  setForm({ ...form, pay: formatAmountInput(e.target.value) })
                }
                required
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2 text-sm text-[#0A1A3C]"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2 text-sm text-[#0A1A3C]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2 text-sm text-[#0A1A3C]"
              />
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#2F80ED]"
                />
                Active
              </label>
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-black text-[#0A1A3C] transition hover:bg-[#E8F1FF] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : editingId ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add module'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm({ ...emptyForm })
                  }}
                  className="w-full rounded-lg bg-[#07132B] py-3 text-sm font-bold text-white hover:bg-[#12306B]"
                >
                  Cancel edit
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTasksPage
