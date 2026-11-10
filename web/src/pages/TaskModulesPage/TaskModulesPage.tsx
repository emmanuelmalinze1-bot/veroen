import { useEffect, useMemo, useState } from 'react'

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CheckCircle2,
  ClipboardList,
  Flame,
  ListChecks,
  Loader2,
  Lock,
  MessageCircle,
  PhoneCall,
  Sparkles,
} from 'lucide-react'

import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'

const money = (value: number) => `₦${(value || 0).toLocaleString('en-NG')}`

const CATEGORY_ICONS: Record<string, typeof ListChecks> = {
  CallCash: PhoneCall,
  Converse: MessageCircle,
  Surveys: ClipboardList,
  'IQ Tasks': Brain,
  Streak: Flame,
  EasyOwn: Sparkles,
}

const TaskModulesPage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [startingId, setStartingId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as any)
        .filter((task) => task.active !== false)
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setTasks(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(
      query(collection(db, 'submissions'), where('userId', '==', user.uid)),
      (snap) => {
        setSubmissions(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
        )
      }
    )
    return () => unsub()
  }, [user])

  const activated = !!profile?.activated
  const completedIds = useMemo(
    () => new Set(submissions.map((s) => s.taskId).filter(Boolean)),
    [submissions]
  )

  const handleComplete = async (task: any) => {
    if (!activated) {
      navigate(routes.deposit())
      return
    }
    if (!user?.uid || startingId) return
    setStartingId(task.id)
    setNotice('')
    try {
      await addDoc(collection(db, 'submissions'), {
        userId: user.uid,
        userEmail: user.email || '',
        userName: profile?.name || user.displayName || '',
        taskId: task.id,
        taskName: task.moduleName || 'Task completed',
        taskCategory: task.category || '',
        payout: Number(task.pay) || 0,
        status: 'completed',
        createdAt: serverTimestamp(),
      })
      setNotice(
        `Task completed — ${money(Number(task.pay) || 0)} added to your balance.`
      )
      setTimeout(() => setNotice(''), 4000)
    } catch (err) {
      console.error('Task completion failed:', err)
      setNotice('Could not complete this task. Please try again.')
    } finally {
      setStartingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] px-4 pb-24 pt-4">
      <Metadata title="Task modules — VIREON" />

      {activated ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#0A1A3C] to-[#12306B] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
            Available modules
          </p>
          <h1 className="mt-1 text-2xl font-black">
            {tasks.length} task{tasks.length === 1 ? '' : 's'} to earn from
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Complete a module below and your payout is added to your balance
            instantly.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-amber-900">
                Browse now, activate to earn
              </h1>
              <p className="mt-1 text-sm text-amber-800">
                You can see every task module. Activate your account to start
                completing them and receiving payouts.
              </p>
              <Link
                to={routes.deposit()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2F80ED] px-5 py-2.5 text-sm font-black text-white"
              >
                <BadgeCheck className="h-4 w-4" /> Activate account
              </Link>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          {notice}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F5] bg-white py-14 text-center">
            <ListChecks className="mx-auto h-12 w-12 text-[#CBD5E1]" />
            <h2 className="mt-3 text-base font-black text-[#0A1A3C]">
              No task modules yet
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              New modules will appear here as soon as the admin uploads them.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const Icon = CATEGORY_ICONS[task.category] || ListChecks
            const completed = completedIds.has(task.id)
            return (
              <div
                key={task.id}
                className="rounded-2xl border border-[#E2E8F5] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FF] text-[#2F80ED]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-[#0A1A3C]">
                        {task.moduleName || 'Untitled module'}
                      </p>
                      <span className="rounded-full bg-[#E8F1FF] px-2 py-0.5 text-[10px] font-bold uppercase text-[#2F80ED]">
                        {task.category || 'Other'}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                        {task.description}
                      </p>
                    )}
                    <p className="mt-2 text-base font-black text-[#2F80ED]">
                      {money(Number(task.pay) || 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t border-[#E2E8F5] pt-3">
                  {completed ? (
                    <span className="flex items-center justify-center gap-2 rounded-full bg-emerald-50 py-2.5 text-sm font-black text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </span>
                  ) : activated ? (
                    <button
                      onClick={() => handleComplete(task)}
                      disabled={startingId === task.id}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2F80ED] py-2.5 text-sm font-black text-white transition hover:bg-[#1D6FE0] disabled:opacity-60"
                    >
                      {startingId === task.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {startingId === task.id ? 'Completing...' : 'Start task'}
                    </button>
                  ) : (
                    <Link
                      to={routes.deposit()}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E2E8F5] bg-[#F4F7FE] py-2.5 text-sm font-black text-[#64748B]"
                    >
                      <Lock className="h-4 w-4" /> Activate to start
                    </Link>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TaskModulesPage
