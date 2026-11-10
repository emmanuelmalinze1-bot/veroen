import { useEffect, useState } from 'react'

import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  ArrowLeft,
  Banknote,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Wallet,
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

const AdminUserDetailPage = ({ id }: { id: string }) => {
  const [profile, setProfile] = useState<any>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    const unsub = onSnapshot(doc(db, 'users', id), (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return () => unsub()
  }, [id])

  useEffect(() => {
    if (!id) return
    const q = query(collection(db, 'withdrawals'), where('userId', '==', id))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setWithdrawals(data)
      setLoading(false)
    })
    return () => unsub()
  }, [id])

  const paid = withdrawals
    .filter((w) => w.status === 'paid')
    .reduce((s, w) => s + (w.amount || 0), 0)
  const pending = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((s, w) => s + (w.amount || 0), 0)

  const handleToggleActivation = async () => {
    if (!id || !profile) return
    setUpdating(true)
    try {
      await updateDoc(
        doc(db, 'users', id),
        profile.activated
          ? { activated: false, rewardPending: false }
          : {
              activated: true,
              activatedAt: serverTimestamp(),
              ...(profile.rewardClaimed ? {} : { rewardPending: true }),
            }
      )
    } catch (err) {
      console.error('Activation update failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans">
      <Metadata title="User Details — VIREON" />

      <header className="bg-[#0A1A3C] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(routes.adminUsers())}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">User Details</h1>
          </div>
          <button
            onClick={handleToggleActivation}
            disabled={updating || !profile}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:opacity-50 ${
              profile?.activated
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BadgeCheck className="h-4 w-4" />
            )}
            {profile?.activated ? 'Deactivate' : 'Activate user'}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <div className="rounded-2xl border border-[#E2E8F5] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0A1A3C] text-2xl font-black text-white">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-[#0A1A3C]">
                    {profile?.name || 'Loading...'}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      profile?.activated
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#E8F1FF] text-[#2F80ED]'
                    }`}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {profile?.activated ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-sm text-[#64748B]">
                  <Mail className="h-4 w-4" /> {profile?.email || ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="min-w-[100px] rounded-xl bg-[#0A1A3C] px-4 py-2 text-center text-white">
                <p className="text-[10px] font-bold uppercase opacity-70">
                  Paid out
                </p>
                <p className="text-lg font-black">{money(paid)}</p>
              </div>
              <div className="min-w-[100px] rounded-xl border border-[#E2E8F5] px-4 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-[#2F80ED]">
                  Pending
                </p>
                <p className="text-lg font-black text-[#0A1A3C]">
                  {money(pending)}
                </p>
              </div>
              <div className="min-w-[100px] rounded-xl border border-[#E2E8F5] px-4 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-[#64748B]">
                  Requests
                </p>
                <p className="text-lg font-black text-[#0A1A3C]">
                  {withdrawals.length}
                </p>
              </div>
            </div>
          </div>

          {profile && (
            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#E2E8F5] pt-4 md:grid-cols-2 lg:grid-cols-3">
              {profile.phone && (
                <p className="flex items-center gap-2 text-sm text-[#334155]">
                  <Phone className="h-4 w-4 text-[#2F80ED]" /> {profile.phone}
                </p>
              )}
              {profile.country && (
                <p className="flex items-center gap-2 text-sm text-[#334155]">
                  <MapPin className="h-4 w-4 text-[#2F80ED]" />{' '}
                  {profile.country}
                </p>
              )}
              <p className="flex items-center gap-2 text-sm capitalize text-[#334155]">
                <BadgeCheck className="h-4 w-4 text-[#2F80ED]" /> Plan:{' '}
                {profile.plan || 'starter'}
              </p>
              {profile.bankName && (
                <p className="flex items-center gap-2 text-sm text-[#334155]">
                  <Banknote className="h-4 w-4 text-[#2F80ED]" />{' '}
                  {profile.bankName}
                </p>
              )}
              {profile.bankAccountNumber && (
                <p className="flex items-center gap-2 text-sm text-[#334155]">
                  <Wallet className="h-4 w-4 text-[#2F80ED]" />{' '}
                  {profile.bankAccountNumber}
                </p>
              )}
              {profile.accountName && (
                <p className="flex items-center gap-2 text-sm text-[#334155]">
                  <CheckCircle2 className="h-4 w-4 text-[#2F80ED]" />{' '}
                  {profile.accountName}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E2E8F5] bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0A1A3C]">
            <Wallet className="h-5 w-5 text-[#2F80ED]" /> Withdrawal history (
            {withdrawals.length})
          </h2>

          {loading ? (
            <p className="py-8 text-center text-sm text-[#94A3B8]">
              Loading withdrawals...
            </p>
          ) : withdrawals.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94A3B8]">
              No withdrawal requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F5] p-4"
                >
                  <div>
                    <p className="text-sm font-black text-[#0A1A3C]">
                      {money(w.amount)}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                      <Clock className="h-3 w-3" /> {formatDate(w.createdAt)}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {w.bank} · {w.accountNumber}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUserDetailPage
