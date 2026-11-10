import { useEffect, useState } from 'react'

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
  ArrowRight,
  Globe2,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import VireonLogo from 'src/components/VireonLogo/VireonLogo'
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

const RegisterPage = () => {
  const { user, googleSignIn } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('Nigeria')
  const [plan, setPlan] = useState('activated')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setName(user.displayName || '')
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) {
        const data = snap.data()
        if (data.name) setName(data.name)
        if (data.phone) setPhone(data.phone)
        if (data.country) setCountry(data.country)
        if (data.plan) setPlan(data.plan)
      }
    }
    load()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: name.trim() || user.displayName || 'User',
          email: user.email || '',
          uid: user.uid,
          phone: phone.trim(),
          country,
          plan,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
      navigate(routes.home())
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Could not save your details. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FE] p-4 font-sans text-[#0F172A]">
      <Metadata title="Complete your VIREON profile" />
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <VireonLogo size={56} />
          <h1 className="mt-4 text-2xl font-black text-[#0A1A3C]">
            Complete your profile
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            A few details and your VIREON dashboard is ready.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F5] bg-white p-6 shadow-sm">
          {!user ? (
            <div className="text-center">
              <p className="text-sm text-[#64748B]">
                Sign in with Google to create your account.
              </p>
              <button
                onClick={() => googleSignIn()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#2F80ED] py-3 text-sm font-black text-white hover:bg-[#1D6FE0]"
              >
                <Globe2 className="h-4 w-4" /> Continue with Google
              </button>
              <button
                onClick={() => navigate(routes.landing())}
                className="mt-3 text-xs font-bold text-[#64748B] hover:text-[#0A1A3C]"
              >
                Back to home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Email
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F5] bg-[#F4F7FE] px-4 py-3 text-sm font-medium text-[#475569]">
                  <ShieldCheck className="h-4 w-4 text-[#2F80ED]" />
                  {user.email}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Full name
                </span>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-[#E2E8F5] bg-[#F4F7FE] py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#2F80ED]"
                  />
                </div>
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
                    placeholder="080 0000 0000"
                    className="w-full rounded-xl border border-[#E2E8F5] bg-[#F4F7FE] py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#2F80ED]"
                  />
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Country
                </span>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#E2E8F5] bg-[#F4F7FE] py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#2F80ED]"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Plan
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'starter', label: 'Starter', note: 'Free' },
                    { id: 'activated', label: 'Activated', note: '₦2,500' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPlan(option.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        plan === option.id
                          ? 'border-[#2F80ED] bg-[#E8F1FF]'
                          : 'border-[#E2E8F5] bg-white hover:border-[#D6E2F7]'
                      }`}
                    >
                      <p className="text-sm font-black text-[#0A1A3C]">
                        {option.label}
                      </p>
                      <p className="text-xs text-[#64748B]">{option.note}</p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-[#94A3B8]">
                  Selecting a paid plan does not charge you. Activation happens
                  on the next screen.
                </p>
              </div>

              {error && (
                <p className="text-sm font-semibold text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2F80ED] py-3.5 text-sm font-black text-white transition hover:bg-[#1D6FE0] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Continue to dashboard
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
