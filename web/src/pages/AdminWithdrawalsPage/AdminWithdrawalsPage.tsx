import { useEffect, useState } from 'react'

import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import {
  ArrowLeft,
  Banknote,
  Check,
  Clock,
  MoreVertical,
  X,
} from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { db } from 'src/lib/firebase'

const money = (value: number) => `₦${(value || 0).toLocaleString('en-NG')}`

const formatDate = (ts: any) => {
  if (!ts) return 'No date'
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return isNaN(date.getTime()) ? 'No date' : date.toLocaleString()
}

type Filter = 'pending' | 'paid' | 'rejected' | 'all'

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'withdrawals'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setWithdrawals(data)
    })
    return () => unsub()
  }, [])

  const setStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'withdrawals', id), {
        status,
        reviewedAt: serverTimestamp(),
      })
      setOpenMenuId(null)
    } catch (err) {
      console.error('Could not update withdrawal:', err)
    }
  }

  const counts = {
    pending: withdrawals.filter((w) => w.status === 'pending').length,
    paid: withdrawals.filter((w) => w.status === 'paid').length,
    rejected: withdrawals.filter((w) => w.status === 'rejected').length,
    all: withdrawals.length,
  }

  const display =
    filter === 'all'
      ? withdrawals
      : withdrawals.filter((w) => (w.status || 'pending') === filter)

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans">
      <Metadata title="Admin Withdrawals — VIREON" />

      <header className="bg-[#0A1A3C] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate(routes.admin())}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black">Withdrawals</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {(['pending', 'paid', 'rejected', 'all'] as Filter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
                filter === tab
                  ? 'bg-[#0A1A3C] text-white'
                  : 'border border-[#E2E8F5] bg-white text-[#0A1A3C]'
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {display.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F5] bg-white py-12 text-center">
            <Banknote className="mx-auto h-12 w-12 text-[#CBD5E1]" />
            <p className="mt-3 text-sm text-[#64748B]">
              No {filter === 'all' ? '' : filter} withdrawal requests.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {display.map((w) => (
              <div
                key={w.id}
                className="rounded-2xl border border-[#E2E8F5] bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-black text-[#0A1A3C]">
                        {w.userName || 'User'}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          w.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : w.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {w.status || 'pending'}
                      </span>
                    </div>
                    <p className="truncate text-xs text-[#64748B]">
                      {w.userEmail}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {w.bank || 'No bank'} · {w.accountNumber || 'No account'}{' '}
                      · {w.accountName || 'No name'}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[#94A3B8]">
                      <Clock className="h-3 w-3" /> {formatDate(w.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xl font-black text-[#0A1A3C]">
                      {money(w.amount)}
                    </p>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === w.id ? null : w.id)
                        }
                        className="rounded-full p-2 hover:bg-[#E8F1FF]"
                      >
                        <MoreVertical className="h-5 w-5 text-[#94A3B8]" />
                      </button>
                      {openMenuId === w.id && (
                        <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-[#E2E8F5] bg-white p-1 shadow-lg">
                          <button
                            onClick={() => setStatus(w.id, 'paid')}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
                          >
                            <Check className="h-4 w-4" /> Mark paid
                          </button>
                          <button
                            onClick={() => setStatus(w.id, 'rejected')}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
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

export default AdminWithdrawalsPage
