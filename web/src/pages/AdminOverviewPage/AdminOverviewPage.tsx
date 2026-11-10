import { useEffect, useState } from 'react'

import { collection, onSnapshot } from 'firebase/firestore'
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { db } from 'src/lib/firebase'

const money = (value: number) => `₦${(value || 0).toLocaleString('en-NG')}`

const formatDate = (ts: any) => {
  if (!ts) return 'Just now'
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return isNaN(date.getTime()) ? 'Just now' : date.toLocaleString()
}

const AdminOverviewPage = () => {
  const [users, setUsers] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.lastLogin?.seconds || 0) - (a.lastLogin?.seconds || 0)
      )
      setUsers(data)
    })
    const unsubWd = onSnapshot(collection(db, 'withdrawals'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setWithdrawals(data)
    })
    return () => {
      unsubUsers()
      unsubWd()
    }
  }, [])

  const activated = users.filter((u) => u.activated).length
  const pending = withdrawals.filter((w) => w.status === 'pending')
  const paid = withdrawals.filter((w) => w.status === 'paid')
  const pendingTotal = pending.reduce((s, w) => s + (w.amount || 0), 0)
  const paidTotal = paid.reduce((s, w) => s + (w.amount || 0), 0)

  const stats = [
    { label: 'Total users', value: String(users.length), icon: Users },
    { label: 'Activated', value: String(activated), icon: BadgeCheck },
    { label: 'Pending requests', value: String(pending.length), icon: Clock },
    { label: 'Paid out', value: money(paidTotal), icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans">
      <Metadata title="Admin Overview — VIREON" />

      <header className="bg-[#0A1A3C] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate(routes.admin())}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black">Overview</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#E2E8F5] bg-white p-5"
            >
              <stat.icon className="h-5 w-5 text-[#2F80ED]" />
              <p className="mt-2 text-3xl font-black text-[#0A1A3C]">
                {stat.value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E2E8F5] bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-black text-[#0A1A3C]">
              <Users className="h-5 w-5 text-[#2F80ED]" /> Recent sign-ins
            </h2>
            {users.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#94A3B8]">
                No users yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {users.slice(0, 5).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F5] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0A1A3C]">
                        {u.name || 'User'}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">
                        {u.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-[#2F80ED]">
                        {u.activated ? 'Active' : u.plan || 'Starter'}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">
                        {formatDate(u.lastLogin)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E2E8F5] bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-black text-[#0A1A3C]">
              <Wallet className="h-5 w-5 text-[#2F80ED]" /> Latest withdrawals
            </h2>
            {withdrawals.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#94A3B8]">
                No withdrawal requests yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {withdrawals.slice(0, 5).map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F5] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0A1A3C]">
                        {w.userName || w.userEmail || 'User'}
                      </p>
                      <p className="text-xs capitalize text-[#64748B]">
                        {w.status || 'pending'}
                      </p>
                    </div>
                    <p className="text-sm font-black text-[#0A1A3C]">
                      {money(w.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs font-semibold text-[#64748B]">
              Pending value: {money(pendingTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverviewPage
