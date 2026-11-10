import { useEffect, useState } from 'react'

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Copy,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react'

import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'

const PLAN_FEE = 2500

const BANK_DETAILS = [
  { label: 'Bank', value: 'VIREON Demo Bank' },
  { label: 'Account name', value: 'VIREON TASKS LTD' },
  { label: 'Account number', value: '0123456789' },
  { label: 'Amount', value: '₦2,500' },
]

const ActivationPage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [activating, setActivating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return () => unsub()
  }, [user])

  const handleActivate = async () => {
    if (!user?.uid) return
    setActivating(true)
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          activated: true,
          plan: 'activated',
          activatedAt: serverTimestamp(),
        },
        { merge: true }
      )
      await addDoc(collection(db, 'notifications'), {
        title: 'Account activated',
        body: 'Your VIREON account is now active. Task modules and withdrawals are unlocked.',
        targetEmail: user.email || '',
        createdAt: serverTimestamp(),
      })
      navigate(routes.home())
    } catch (err) {
      console.error('Activation failed:', err)
    } finally {
      setActivating(false)
    }
  }

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText('0123456789')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  if (profile?.activated) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] px-4 pb-24 pt-4">
        <Metadata title="Account active — VIREON" />
        <div className="rounded-2xl border border-[#E2E8F5] bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F1FF] text-[#2F80ED]">
            <BadgeCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-black text-[#0A1A3C]">
            Your account is active
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            All task modules and withdrawal requests are unlocked.
          </p>
          <Link
            to={routes.home()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2F80ED] px-6 py-3 text-sm font-black text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] px-4 pb-24 pt-4">
      <Metadata title="Activate account — VIREON" />

      <div className="rounded-2xl bg-gradient-to-br from-[#0A1A3C] to-[#12306B] p-5 text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" /> Activation
        </span>
        <h1 className="mt-3 text-2xl font-black">Activate your plan</h1>
        <p className="mt-2 text-sm text-white/70">
          Unlock every task module, your full history and withdrawal requests
          for ₦{(PLAN_FEE || 0).toLocaleString()}.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-[#E2E8F5] bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#64748B]">
          <Banknote className="h-4 w-4 text-[#2F80ED]" /> Demo bank details
        </h2>
        <div className="mt-3 divide-y divide-[#E2E8F5]">
          {BANK_DETAILS.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="text-[#64748B]">{row.label}</span>
              <span className="font-bold text-[#0A1A3C]">{row.value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={copyAccount}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F5] py-2.5 text-xs font-bold text-[#0A1A3C]"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy account number
            </>
          )}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          This is a demo activation. Tapping the button below marks your account
          active immediately. No real payment is processed.
        </p>
      </div>

      <button
        onClick={handleActivate}
        disabled={activating}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#2F80ED] py-4 text-base font-black text-white transition hover:bg-[#1D6FE0] disabled:opacity-60"
      >
        {activating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <BadgeCheck className="h-5 w-5" />
        )}
        I&apos;ve paid — activate my account
      </button>
    </div>
  )
}

export default ActivationPage
