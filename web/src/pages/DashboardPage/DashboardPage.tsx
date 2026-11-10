import { useEffect, useState } from 'react'

import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  ListChecks,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react'

import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'

const money = (value: number) => `₦${(value || 0).toLocaleString('en-NG')}`

const DashboardPage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setWithdrawals(data)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'submissions'),
      where('userId', '==', user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setSubmissions(data)
    })
    return () => unsub()
  }, [user])

  const displayName =
    profile?.name || user?.displayName || user?.email?.split('@')[0] || 'there'
  const firstName = displayName.split(' ')[0]

  const totalEarned = submissions.reduce((sum, s) => sum + (s.payout || 0), 0)
  const totalPaid = withdrawals
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + (w.amount || 0), 0)
  const totalPending = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + (w.amount || 0), 0)
  const balance = Math.max(0, totalEarned - totalPaid - totalPending)

  const recent = [
    ...submissions.slice(0, 3).map((s) => ({
      id: `sub-${s.id}`,
      title: s.taskName || 'Task completed',
      meta: s.status || 'completed',
      amount: s.payout || 0,
      date: s.createdAt,
    })),
    ...withdrawals.slice(0, 3).map((w) => ({
      id: `wd-${w.id}`,
      title: 'Withdrawal request',
      meta: w.status || 'pending',
      amount: -(w.amount || 0),
      date: w.createdAt,
    })),
  ].slice(0, 4)

  return (
    <div className="min-h-screen bg-[#F4F7FE] px-4 pb-24 pt-4">
      <Metadata title="Dashboard — VIREON" />

      {/* Greeting */}
      <div className="anim-fade-up">
        <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Welcome back
        </p>
        <h1 className="mt-1 text-2xl font-black text-[#0A1A3C]">
          {firstName}
        </h1>
      </div>

      {/* Plan card */}
      <div className="anim-fade-up mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1A3C] to-[#12306B] p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Current plan
            </p>
            <p className="mt-1 text-2xl font-black capitalize">
              {profile?.plan || 'Starter'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
              profile?.activated
                ? 'bg-[#38BDF8] text-[#07132B]'
                : 'bg-white/15 text-white'
            }`}
          >
            {profile?.activated ? 'Active' : 'Not active'}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Available balance
            </p>
            <p className="mt-1 text-xl font-black">{money(balance)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Pending
            </p>
            <p className="mt-1 text-xl font-black">{money(totalPending)}</p>
          </div>
        </div>
        {!profile?.activated && (
          <Link
            to={routes.activate()}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#2F80ED] py-3 text-sm font-black text-white transition hover:bg-[#1D6FE0]"
          >
            <BadgeCheck className="h-4 w-4" /> Activate your account
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="anim-fade-up mt-4 grid grid-cols-2 gap-3">
        {[
          {
            label: 'Total earned',
            value: money(totalEarned),
            icon: TrendingUp,
          },
          { label: 'Withdrawn', value: money(totalPaid), icon: Wallet },
          {
            label: 'Tasks done',
            value: String(submissions.length),
            icon: CheckCircle2,
          },
          {
            label: 'Requests',
            value: String(withdrawals.length),
            icon: CreditCard,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#E2E8F5] bg-white p-4"
          >
            <stat.icon className="h-5 w-5 text-[#2F80ED]" />
            <p className="mt-2 text-lg font-black text-[#0A1A3C]">
              {stat.value}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="anim-fade-up mt-5">
        <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-[#64748B]">
          Quick links
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Task modules', to: routes.tasks(), icon: ListChecks },
            { label: 'Withdraw', to: routes.withdraw(), icon: Wallet },
            { label: 'Profile', to: routes.profile(), icon: User },
            profile?.activated
              ? {
                  label: 'History',
                  to: routes.withdraw() + '?tab=history',
                  icon: History,
                }
              : { label: 'Activate', to: routes.activate(), icon: Sparkles },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="flex items-center justify-between rounded-2xl border border-[#E2E8F5] bg-white p-4 transition hover:border-[#2F80ED] active:scale-[0.99]"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-[#0A1A3C]">
                <link.icon className="h-4 w-4 text-[#2F80ED]" /> {link.label}
              </span>
              <ArrowRight className="h-4 w-4 text-[#94A3B8]" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="anim-fade-up mt-5 rounded-2xl border border-[#E2E8F5] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#64748B]">
            Recent activity
          </h2>
          <Link
            to={routes.withdraw() + '?tab=history'}
            className="text-xs font-bold text-[#2F80ED]"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="mx-auto h-10 w-10 text-[#CBD5E1]" />
            <p className="mt-2 text-sm text-[#64748B]">
              No activity yet. Your task and withdrawal history will appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[#E2E8F5] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-bold text-[#0A1A3C]">
                    {item.title}
                  </p>
                  <p className="text-[11px] capitalize text-[#64748B]">
                    {item.meta}
                  </p>
                </div>
                <span
                  className={`text-sm font-black ${
                    item.amount >= 0 ? 'text-[#2F80ED]' : 'text-red-500'
                  }`}
                >
                  {item.amount >= 0 ? '+' : '-'}
                  {money(Math.abs(item.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
