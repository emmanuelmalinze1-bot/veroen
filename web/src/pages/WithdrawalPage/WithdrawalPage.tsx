import { useEffect, useState } from 'react'

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
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  History,
  Loader2,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'

import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'

const money = (value: number) => `₦${(value || 0).toLocaleString('en-NG')}`

const formatDate = (ts: any) => {
  if (!ts) return 'Just now'
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return isNaN(date.getTime()) ? 'Just now' : date.toLocaleString()
}

const formatReceiptDate = (date: Date) =>
  date.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

type ReceiptData = {
  amount: number
  bank: string
  accountNumber: string
  accountName: string
  reference: string
  date: Date
}

const toDate = (ts: any): Date => {
  if (ts?.seconds) return new Date(ts.seconds * 1000)
  if (ts?.toDate) return ts.toDate()
  return ts ? new Date(ts) : new Date()
}

const statusMeta = (status?: string) => {
  const value = (status || 'successful').toLowerCase()
  if (['paid', 'successful', 'success', 'completed'].includes(value)) {
    return {
      label: 'Successful',
      Icon: CheckCircle2,
      iconClass: 'bg-emerald-500 text-white shadow-emerald-200',
      textClass: 'text-emerald-600',
      headerClass: 'from-emerald-50',
    }
  }
  if (['rejected', 'failed', 'declined'].includes(value)) {
    return {
      label: 'Rejected',
      Icon: XCircle,
      iconClass: 'bg-red-500 text-white shadow-red-200',
      textClass: 'text-red-600',
      headerClass: 'from-red-50',
    }
  }
  return {
    label: 'Pending',
    Icon: Clock,
    iconClass: 'bg-amber-500 text-white shadow-amber-200',
    textClass: 'text-amber-600',
    headerClass: 'from-amber-50',
  }
}

const ReceiptRow = ({
  label,
  value,
  mono,
  bold,
}: {
  label: string
  value: string
  mono?: boolean
  bold?: boolean
}) => (
  <div className="flex items-start justify-between gap-3 py-1.5">
    <span className="text-[11px] font-medium text-[#64748B]">{label}</span>
    <span
      className={`text-right text-xs text-[#0A1A3C] ${
        bold ? 'font-black' : 'font-bold'
      } ${mono ? 'font-mono tracking-wide' : ''}`}
    >
      {value}
    </span>
  </div>
)

const ReceiptCard = ({
  amount,
  status,
  date,
  reference,
  bank,
  accountNumber,
  accountName,
}: {
  amount: number
  status?: string
  date: Date
  reference: string
  bank?: string
  accountNumber?: string
  accountName?: string
}) => {
  const meta = statusMeta(status)
  const StatusIcon = meta.Icon

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F5] bg-white shadow-sm">
      <div
        className={`bg-gradient-to-b ${meta.headerClass} to-white px-5 pb-4 pt-5 text-center`}
      >
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full shadow-lg ${meta.iconClass}`}
        >
          <StatusIcon className="h-6 w-6" />
        </div>
        <p
          className={`mt-3 text-[10px] font-black uppercase tracking-[0.2em] ${meta.textClass}`}
        >
          {meta.label}
        </p>
        <p className="mt-0.5 text-2xl font-black text-[#0A1A3C]">
          {money(amount)}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-[#64748B]">
          {formatReceiptDate(date)}
        </p>
      </div>

      <div className="relative border-t border-dashed border-[#E2E8F5]">
        <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-[#F4F7FE]" />
        <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-[#F4F7FE]" />
      </div>

      <div className="px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">
          Transaction details
        </p>
        <div className="mt-1 divide-y divide-[#E2E8F5]">
          <ReceiptRow label="Status" value={meta.label} bold />
          <ReceiptRow label="Date & time" value={formatReceiptDate(date)} />
          <ReceiptRow label="Reference" value={reference} mono />
          <ReceiptRow label="Bank" value={bank || '—'} />
          <ReceiptRow label="Account number" value={accountNumber || '—'} />
          <ReceiptRow label="Account name" value={accountName || '—'} />
          <ReceiptRow label="Amount" value={money(amount)} bold />
        </div>
      </div>

      <div className="border-t border-[#E2E8F5] bg-[#F4F7FE] px-4 py-2 text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B]">
          VIREON
        </p>
        <p className="mt-0.5 text-[9px] text-[#94A3B8]">
          Withdrawal receipt · Keep for your records
        </p>
      </div>
    </div>
  )
}

type Tab = 'withdraw' | 'history'

const WithdrawalPage = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'withdraw'
    return new URLSearchParams(window.location.search).get('tab') === 'history'
      ? 'history'
      : 'withdraw'
  })
  const [profile, setProfile] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [copied, setCopied] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const data = snap.exists() ? snap.data() : null
      setProfile(data)
      if (data?.name) setAccountName((prev) => prev || data.name)
      if (data?.bankAccountNumber)
        setAccountNumber((prev) => prev || data.bankAccountNumber)
      if (data?.bankName) setBank((prev) => prev || data.bankName)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(
      query(collection(db, 'submissions'), where('userId', '==', user.uid)),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
        data.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        )
        setSubmissions(data)
      }
    )
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(
      query(collection(db, 'withdrawals'), where('userId', '==', user.uid)),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
        data.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        )
        setWithdrawals(data)
      }
    )
    return () => unsub()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const parsed = Number(amount)
    if (!parsed || parsed <= 0) {
      setError('Enter a valid amount.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const docRef = await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        userEmail: user.email || '',
        userName: profile?.name || user.displayName || '',
        amount: parsed,
        bank,
        accountNumber,
        accountName,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setReceipt({
        amount: parsed,
        bank,
        accountNumber,
        accountName,
        reference: `VRN-${docRef.id.slice(0, 8).toUpperCase()}`,
        date: new Date(),
      })
      setSuccess(true)
      setAmount('')
    } catch (err) {
      console.error('Withdrawal request failed:', err)
      setError('Could not submit your request. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const copyReceipt = async () => {
    if (!receipt) return
    const text = [
      'VIREON — Withdrawal receipt',
      'Status: Successful',
      `Amount: ${money(receipt.amount)}`,
      `Date: ${formatReceiptDate(receipt.date)}`,
      `Reference: ${receipt.reference}`,
      `Bank: ${receipt.bank}`,
      `Account number: ${receipt.accountNumber}`,
      `Account name: ${receipt.accountName}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const totalEarned = submissions.reduce(
    (sum, item) => sum + (item.payout || 0),
    0
  )
  const totalWithdrawn = withdrawals
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <div className="min-h-screen bg-[#F4F7FE] px-3 pb-20 pt-3">
      <Metadata title="Withdraw — VIREON" />

      <h1 className="text-lg font-black text-[#0A1A3C]">
        {tab === 'withdraw' ? 'Withdraw funds' : 'Activity history'}
      </h1>
      <p className="mt-0.5 text-xs text-[#64748B]">
        {tab === 'withdraw'
          ? 'Submit a request and track its status from history.'
          : 'Every task payout and withdrawal request in one place.'}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-[#E2E8F5] bg-white p-1">
        <button
          onClick={() => setTab('withdraw')}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold transition ${
            tab === 'withdraw'
              ? 'bg-[#0A1A3C] text-white'
              : 'text-[#64748B] hover:bg-[#F4F7FE]'
          }`}
        >
          <Wallet className="h-3.5 w-3.5" /> Withdraw funds
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold transition ${
            tab === 'history'
              ? 'bg-[#0A1A3C] text-white'
              : 'text-[#64748B] hover:bg-[#F4F7FE]'
          }`}
        >
          <History className="h-3.5 w-3.5" /> History
        </button>
      </div>

      {tab === 'withdraw' ? (
        !profile?.activated ? (
          <div className="mt-3 rounded-xl border border-[#E2E8F5] bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FF] text-[#2F80ED]">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-lg font-black text-[#0A1A3C]">
              Activate to withdraw
            </h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Withdrawal requests are available on an activated plan.
            </p>
            <Link
              to={routes.activate()}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED] px-5 py-2.5 text-xs font-black text-white"
            >
              Activate account <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : success && receipt ? (
          <div className="mt-3">
            <ReceiptCard
              amount={receipt.amount}
              status="successful"
              date={receipt.date}
              reference={receipt.reference}
              bank={receipt.bank}
              accountNumber={receipt.accountNumber}
              accountName={receipt.accountName}
            />
            <div className="mt-3 flex flex-col gap-1.5">
              <button
                onClick={() => setTab('history')}
                className="rounded-full bg-[#0A1A3C] py-2.5 text-xs font-black text-white"
              >
                View history
              </button>
              <button
                onClick={copyReceipt}
                className="flex items-center justify-center gap-1.5 rounded-full border border-[#E2E8F5] bg-white py-2.5 text-xs font-bold text-[#0A1A3C]"
              >
                {copied ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Receipt copied' : 'Copy receipt details'}
              </button>
              <button
                onClick={() => {
                  setSuccess(false)
                  setReceipt(null)
                }}
                className="py-1.5 text-xs font-bold text-[#64748B]"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-3 space-y-3 rounded-xl border border-[#E2E8F5] bg-white p-4"
          >
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Amount
              </span>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="Amount in naira"
                  className="w-full rounded-lg border border-[#E2E8F5] bg-[#F4F7FE] py-2.5 pl-9 pr-3 text-[13px] font-medium outline-none focus:border-[#2F80ED]"
                />
              </div>
              {profile && (
                <p className="mt-1 text-[11px] text-[#94A3B8]">
                  Available balance:{' '}
                  {money(profile.balance || profile.availableBalance || 0)}
                </p>
              )}
            </div>

            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Bank name
              </span>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  required
                  placeholder="e.g. GTBank"
                  className="w-full rounded-lg border border-[#E2E8F5] bg-[#F4F7FE] py-2.5 pl-9 pr-3 text-[13px] font-medium outline-none focus:border-[#2F80ED]"
                />
              </div>
            </div>

            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Account number
              </span>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  placeholder="0123456789"
                  className="w-full rounded-lg border border-[#E2E8F5] bg-[#F4F7FE] py-2.5 pl-9 pr-3 text-[13px] font-medium outline-none focus:border-[#2F80ED]"
                />
              </div>
            </div>

            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Account name
              </span>
              <input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                placeholder="Name on the account"
                className="w-full rounded-lg border border-[#E2E8F5] bg-[#F4F7FE] px-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#2F80ED]"
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#2F80ED] py-3 text-[13px] font-black text-white transition hover:bg-[#1D6FE0] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
              Request withdrawal
            </button>
          </form>
        )
      ) : (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[#E2E8F5] bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Task earnings
              </p>
              <p className="mt-0.5 text-base font-black text-[#0A1A3C]">
                {money(totalEarned)}
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E8F5] bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Withdrawn
              </p>
              <p className="mt-0.5 text-base font-black text-[#0A1A3C]">
                {money(totalWithdrawn)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F5] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#64748B]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2F80ED]" /> Task history
              </h2>
              <span className="text-[10px] font-bold text-[#94A3B8]">
                {submissions.length}
              </span>
            </div>
            {submissions.length === 0 ? (
              <p className="py-5 text-center text-xs text-[#94A3B8]">
                No completed tasks yet.
              </p>
            ) : (
              <div className="space-y-1.5">
                {submissions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-[#E2E8F5] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[#0A1A3C]">
                        {item.taskName || 'Task completed'}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <span className="text-[13px] font-black text-[#2F80ED]">
                      +{money(item.payout || 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#E2E8F5] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#64748B]">
                <Wallet className="h-3.5 w-3.5 text-[#2F80ED]" /> Withdrawal history
              </h2>
              <span className="text-[10px] font-bold text-[#94A3B8]">
                {withdrawals.length}
              </span>
            </div>
            {withdrawals.length === 0 ? (
              <div className="py-5 text-center">
                <Clock className="mx-auto h-7 w-7 text-[#CBD5E1]" />
                <p className="mt-1.5 text-xs text-[#94A3B8]">
                  No withdrawal requests yet.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {withdrawals.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#E2E8F5] px-3 py-2 text-left transition hover:border-[#2F80ED] hover:bg-[#F4F7FE]"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#0A1A3C]">
                        Withdrawal request
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {formatDate(item.createdAt)}
                      </p>
                      <span
                        className={`mt-0.5 inline-block text-[10px] font-bold uppercase ${
                          statusMeta(item.status).textClass
                        }`}
                      >
                        {statusMeta(item.status).label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-black text-[#0A1A3C]">
                        {money(item.amount || 0)}
                      </p>
                      <ArrowRight className="h-3.5 w-3.5 text-[#94A3B8]" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close receipt"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative w-full max-w-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black text-white">
                Withdrawal receipt
              </p>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-white/15 p-1.5 text-white"
                aria-label="Close receipt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[82vh] overflow-y-auto rounded-2xl">
              <ReceiptCard
                amount={Number(selected.amount) || 0}
                status={selected.status}
                date={toDate(selected.createdAt)}
                reference={`VRN-${String(selected.id || '')
                  .slice(0, 8)
                  .toUpperCase()}`}
                bank={selected.bank}
                accountNumber={selected.accountNumber}
                accountName={selected.accountName}
              />
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-2 w-full rounded-full bg-white py-2.5 text-xs font-black text-[#0A1A3C]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WithdrawalPage
