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
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'

import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'

const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'United Kingdom',
  'United States',
  'Canada',
  'Other',
]

const ISSUES = [
  'Withdrawal is delayed',
  'Task payout is missing',
  'Account activation issue',
  'Profile / login problem',
  'App technical issue',
]

const UserProfilePage = () => {
  const { user, logOut, isAuthenticated, loading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('Nigeria')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [issueOther, setIssueOther] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      setProfile({ id: snap.id, ...data })
      setName(data.name || user.displayName || '')
      setPhone(data.phone || '')
      setCountry(data.country || 'Nigeria')
      setBankName(data.bankName || '')
      setBankAccountNumber(data.bankAccountNumber || '')
      setAccountName(data.accountName || '')
    })
    return () => unsub()
  }, [user])

  const displayName =
    profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          name,
          phone,
          country,
          bankName,
          bankAccountNumber,
          accountName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logOut()
      navigate(routes.landing(), { replace: true })
    } catch (err) {
      console.error('Logout failed', err)
      setIsLoggingOut(false)
    }
  }

  const handleHelpSubmit = async () => {
    if (!user) return
    if (!phone) {
      alert('Add your phone number in payout details before submitting.')
      setIsAccountOpen(true)
      return
    }
    try {
      await addDoc(collection(db, 'help'), {
        userEmail: user.email,
        userPhone: phone,
        issueType,
        issueOther,
        createdAt: serverTimestamp(),
      })
      alert('Help request submitted.')
      setIsHelpOpen(false)
      setIssueType('')
      setIssueOther('')
    } catch (err) {
      console.error('Error submitting help:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FE]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2F80ED]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] px-4 py-10">
        <Metadata title="Profile — VIREON" />
        <div className="rounded-2xl border border-[#E2E8F5] bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F1FF] text-[#2F80ED]">
            <UserIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-black text-[#0A1A3C]">
            You&apos;re not logged in
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Sign in to manage your profile and payout details.
          </p>
          <Link
            to={routes.landing()}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#0A1A3C] px-6 py-3 text-sm font-bold text-white"
          >
            Go to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] pb-24">
      <Metadata title="Profile — VIREON" />

      <div className="border-b border-[#E2E8F5] bg-white px-4 pb-8 pt-6">
        <div className="anim-fade-up flex items-center gap-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="h-14 w-14 rounded-full border border-[#E2E8F5] object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A1A3C] text-xl font-black text-white">
              {displayName[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#0A1A3C]">
                {displayName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#BFDBFE] bg-[#E8F1FF] px-2.5 py-1 text-[11px] font-bold text-[#2F80ED]">
                <ShieldCheck className="h-3.5 w-3.5" />
                {profile?.activated ? 'Active' : 'Starter'}
              </span>
            </div>
            <p className="flex items-center gap-1.5 truncate text-sm font-medium text-[#64748B]">
              <Mail className="h-4 w-4 shrink-0 text-[#94A3B8]" /> {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div className="anim-fade-up rounded-2xl border border-[#E2E8F5] bg-white">
          <div className="divide-y divide-[#E2E8F5]">
            <button
              onClick={() => navigate(routes.withdraw() + '?tab=history')}
              className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-[#F4F7FE]"
            >
              <span className="flex items-center gap-3 text-base font-semibold text-[#0A1A3C]">
                <CreditCard className="h-5 w-5 text-[#64748B]" /> Activity
                history
              </span>
              <ChevronRight className="h-5 w-5 text-[#64748B]" />
            </button>

            <button
              onClick={() => navigate(routes.deposit())}
              className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-[#F4F7FE]"
            >
              <span className="flex items-center gap-3 text-base font-semibold text-[#0A1A3C]">
                <Banknote className="h-5 w-5 text-[#64748B]" /> Deposit
              </span>
              <ChevronRight className="h-5 w-5 text-[#64748B]" />
            </button>

            <div>
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-[#F4F7FE]"
              >
                <span className="flex items-center gap-3 text-base font-semibold text-[#0A1A3C]">
                  <Banknote className="h-5 w-5 text-[#64748B]" /> Payout details
                </span>
                <ChevronRight className="h-5 w-5 text-[#64748B]" />
              </button>

              {isAccountOpen && (
                <form
                  onSubmit={handleSave}
                  className="space-y-4 border-t border-[#E2E8F5] bg-white p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Full name
                      </span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-[#E2E8F5] bg-[#F4F7FE] px-4 py-3 text-sm font-medium outline-none focus:border-[#2F80ED]"
                      />
                    </div>
                    <div>
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Phone number
                      </span>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full rounded-2xl border border-[#E2E8F5] bg-[#F4F7FE] py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#2F80ED]"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Country
                      </span>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-2xl border border-[#E2E8F5] bg-[#F4F7FE] px-4 py-3 text-sm font-medium outline-none focus:border-[#2F80ED]"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Bank name
                      </span>
                      <input
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. GTBank"
                        className="w-full rounded-2xl border border-[#E2E8F5] bg-[#F4F7FE] px-4 py-3 text-sm font-medium outline-none focus:border-[#2F80ED]"
                      />
                    </div>
                    <div>
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Account number
                      </span>
                      <input
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="0123456789"
                        className="w-full rounded-2xl border border-[#E2E8F5] bg-[#F4F7FE] px-4 py-3 text-sm font-medium outline-none focus:border-[#2F80ED]"
                      />
                    </div>
                    <div>
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Account name
                      </span>
                      <input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Name on the account"
                        className="w-full rounded-2xl border border-[#E2E8F5] bg-[#F4F7FE] px-4 py-3 text-sm font-medium outline-none focus:border-[#2F80ED]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-[#E2E8F5] pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold transition active:scale-95 disabled:opacity-60 ${
                        saved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#2F80ED] text-white hover:bg-[#1D6FE0]'
                      }`}
                    >
                      {saved ? (
                        <>
                          <Check className="h-4 w-4" /> Saved
                        </>
                      ) : saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div>
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-[#F4F7FE]"
              >
                <span className="flex items-center gap-3 text-base font-semibold text-[#0A1A3C]">
                  <HelpCircle className="h-5 w-5 text-[#64748B]" /> Help &
                  support
                </span>
                <ChevronRight className="h-5 w-5 text-[#64748B]" />
              </button>

              {isHelpOpen && (
                <div className="space-y-4 border-t border-[#E2E8F5] bg-white p-4">
                  <p className="text-sm font-bold text-[#64748B]">
                    What do you need help with?
                  </p>
                  <div className="space-y-3">
                    {ISSUES.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#0A1A3C]"
                      >
                        <input
                          type="radio"
                          name="issueType"
                          value={option}
                          checked={issueType === option}
                          onChange={(e) => setIssueType(e.target.value)}
                          className="h-5 w-5 accent-[#2F80ED]"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  <input
                    value={issueOther}
                    onChange={(e) => setIssueOther(e.target.value)}
                    placeholder="More details..."
                    className="w-full rounded-xl border border-[#E2E8F5] bg-[#F4F7FE] px-4 py-2 text-sm outline-none focus:border-[#2F80ED]"
                  />
                  <button
                    onClick={handleHelpSubmit}
                    className="w-full rounded-xl bg-[#0A1A3C] py-3 text-sm font-bold text-white"
                  >
                    Submit request
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-red-50"
            >
              <span className="flex items-center gap-3 text-base font-semibold text-red-600">
                <LogOut className="h-5 w-5" /> Log out
              </span>
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-red-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
