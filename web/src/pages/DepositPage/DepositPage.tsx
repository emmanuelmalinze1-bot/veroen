import { useEffect, useState } from 'react'

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Copy,
  ImageIcon,
  Loader2,
  Send,
  ShieldCheck,
  Upload,
} from 'lucide-react'

import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/contexts/AuthContexts'
import { getActivationAmount } from 'src/lib/activation'
import { db } from 'src/lib/firebase'

const DEPOSIT_ACCOUNT = {
  bank: 'OPay',
  accountName: 'Vision Concepts',
  accountNumber: '9067451563',
}

const TELEGRAM_SUPPORT = 'https://t.me/thevalue4k'

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 800
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas unavailable'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.6))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const DepositPage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return () => unsub()
  }, [user])

  const activationAmount = getActivationAmount(profile)

  const handleFile = (file: File | null) => {
    if (!file) return
    setError('')
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
  }

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(DEPOSIT_ACCOUNT.accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePaid = async () => {
    if (!user?.uid) return
    if (!screenshot) {
      setError('Upload your payment screenshot before continuing.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const image = await compressImage(screenshot)
      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        userEmail: user.email || '',
        userName: profile?.name || user.displayName || '',
        amount: activationAmount,
        plan: profile?.plan || 'starter',
        bank: DEPOSIT_ACCOUNT.bank,
        accountNumber: DEPOSIT_ACCOUNT.accountNumber,
        accountName: DEPOSIT_ACCOUNT.accountName,
        screenshot: image,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Deposit request failed:', err)
    } finally {
      setSaving(false)
      window.location.href = TELEGRAM_SUPPORT
    }
  }

  if (profile?.activated) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] px-3 pb-20 pt-3">
        <Metadata title="Deposit — VIREON" />
        <div className="rounded-xl border border-[#E2E8F5] bg-white p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-lg font-black text-[#0A1A3C]">
            Your account is active
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            You can now start tasks and request withdrawals.
          </p>
          <Link
            to={routes.home()}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED] px-5 py-2.5 text-xs font-black text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] px-3 pb-20 pt-3">
      <Metadata title="Deposit — VIREON" />

      <div className="rounded-xl bg-gradient-to-br from-[#0A1A3C] to-[#12306B] p-5 text-white">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
          <ShieldCheck className="h-3 w-3" /> Activation deposit
        </span>
        <h1 className="mt-2 text-xl font-black">Deposit to activate</h1>
        <p className="mt-1 text-xs text-white/70">
          Pay ₦{activationAmount.toLocaleString()} to the account below, upload
          your payment screenshot, then confirm on Telegram. Once activated,
          claim your ₦{activationAmount.toLocaleString()} reward.
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-[#E2E8F5] bg-white p-4">
        <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#64748B]">
          <Banknote className="h-3.5 w-3.5 text-[#2F80ED]" /> Deposit account
        </h2>
        <div className="mt-2 divide-y divide-[#E2E8F5]">
          <div className="flex items-center justify-between py-2.5 text-[13px]">
            <span className="text-[#64748B]">Bank</span>
            <span className="font-bold text-[#0A1A3C]">
              {DEPOSIT_ACCOUNT.bank}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-[13px]">
            <span className="text-[#64748B]">Account name</span>
            <span className="font-bold text-[#0A1A3C]">
              {DEPOSIT_ACCOUNT.accountName}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-[13px] text-[#64748B]">Account number</span>
            <button
              onClick={copyAccount}
              className="flex items-center gap-1.5 rounded-lg bg-[#E8F1FF] px-2.5 py-1.5 text-[13px] font-black text-[#0A1A3C]"
            >
              {DEPOSIT_ACCOUNT.accountNumber}
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-[#2F80ED]" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between py-2.5 text-[13px]">
            <span className="text-[#64748B]">Plan</span>
            <span className="font-bold capitalize text-[#0A1A3C]">
              {profile?.activationPlanLabel || profile?.plan || 'Starter'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-[13px]">
            <span className="text-[#64748B]">Amount</span>
            <span className="font-black text-[#2F80ED]">
              ₦{activationAmount.toLocaleString()}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-[#94A3B8]">
          {copied
            ? 'Account number copied.'
            : 'Tap the account number to copy.'}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-[#E2E8F5] bg-white p-4">
        <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#64748B]">
          <ImageIcon className="h-3.5 w-3.5 text-[#2F80ED]" /> Payment
          screenshot
        </h2>
        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F4F7FE] p-5 text-center transition hover:border-[#2F80ED]">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          {preview ? (
            <img
              src={preview}
              alt="Payment screenshot preview"
              className="max-h-48 w-auto rounded-lg border border-[#E2E8F5] object-contain"
            />
          ) : (
            <>
              <Upload className="h-6 w-6 text-[#2F80ED]" />
              <span className="mt-1.5 text-[13px] font-bold text-[#0A1A3C]">
                Upload payment screenshot
              </span>
              <span className="mt-0.5 text-[10px] text-[#94A3B8]">
                PNG or JPG
              </span>
            </>
          )}
        </label>
        {preview && (
          <p className="mt-2 text-[10px] text-[#64748B]">
            {screenshot?.name} · tap to replace
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={handlePaid}
        disabled={saving}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#2F80ED] py-3 text-[13px] font-black text-white transition hover:bg-[#1D6FE0] disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {saving ? 'Saving...' : 'I have paid'}
      </button>

      <p className="mt-2 text-center text-[10px] leading-relaxed text-[#94A3B8]">
        After tapping “I have paid” you will be redirected to our Telegram
        support <span className="font-bold text-[#0A1A3C]">@thevalue4k</span> to
        confirm your payment.
      </p>
    </div>
  )
}

export default DepositPage
