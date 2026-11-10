import { useState } from 'react'

import { doc, getDoc } from 'firebase/firestore'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Globe2,
  Loader2,
  Lock,
  MessageSquare,
  PhoneCall,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import VireonLogo from 'src/components/VireonLogo/VireonLogo'
import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'

const MODULES = [
  {
    name: 'CallCash',
    description:
      'Complete short call tasks and get credited per qualified session.',
    icon: PhoneCall,
  },
  {
    name: 'Converse',
    description:
      'Join guided conversations and receive payouts for participation.',
    icon: MessageSquare,
  },
  {
    name: 'Surveys',
    description:
      'Share quick opinions on products and services you already use.',
    icon: BarChart3,
  },
  {
    name: 'IQ Tasks',
    description:
      'Solve short logic and reasoning challenges for extra earnings.',
    icon: Sparkles,
  },
  {
    name: 'Streak Rewards',
    description:
      'Stay consistent daily and unlock bonus payouts as your streak grows.',
    icon: TrendingUp,
  },
  {
    name: 'EasyOwn',
    description:
      'Track structured milestone tasks and withdraw as you complete them.',
    icon: CheckCircle2,
  },
]

const STEPS = [
  {
    title: 'Create your account',
    text: 'Sign up with Google in one tap, then complete your phone and country details.',
  },
  {
    title: 'Activate your plan',
    text: 'Choose a starter plan and activate your dashboard to unlock task modules.',
  },
  {
    title: 'Complete tasks',
    text: 'Work through CallCash, Converse, Surveys and more from your dashboard.',
  },
  {
    title: 'Withdraw earnings',
    text: 'Request a withdrawal to your bank account and track its status in real time.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Amaka O.',
    country: 'Lagos, Nigeria',
    initials: 'AO',
    quote:
      'I started with surveys on my lunch break. The dashboard makes it obvious what is pending and what has paid.',
  },
  {
    name: 'Daniel K.',
    country: 'Nairobi, Kenya',
    initials: 'DK',
    quote:
      'The withdrawal history is the part I trust most. I can see every request and its status without messaging support.',
  },
  {
    name: 'Fatima B.',
    country: 'Abuja, Nigeria',
    initials: 'FB',
    quote:
      'Clean, simple and no noise. I activated, finished a streak, and requested my first payout the same week.',
  },
  {
    name: 'Tunde A.',
    country: 'Ibadan, Nigeria',
    initials: 'TA',
    quote:
      'I like that everything lives in one place. Tasks, notifications, profile and payouts are all in the dashboard.',
  },
]

const FAQS = [
  {
    q: 'What is VIREON?',
    a: 'VIREON is a task-based earning platform. You complete short online tasks from your dashboard and request withdrawals to your bank account.',
  },
  {
    q: 'Do I need to pay to start?',
    a: 'You create an account free. Task modules are unlocked after you activate a plan from the activation page.',
  },
  {
    q: 'How do withdrawals work?',
    a: 'Submit a withdrawal request from your dashboard. The admin team reviews it and updates the status to paid or rejected.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your account is secured with Google sign-in, and you control the profile and payout details stored on your account.',
  },
]

const LandingPage = () => {
  const { googleSignIn, loading } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  const handleGetStarted = async () => {
    try {
      setSigningIn(true)
      setError('')
      const user = await googleSignIn()
      if (!user) return

      const snap = await getDoc(doc(db, 'users', user.uid))
      const data = snap.data()
      if (!data?.phone || !data?.country) {
        navigate(routes.register())
      } else {
        navigate(routes.home())
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (
        code !== 'auth/popup-closed-by-user' &&
        code !== 'auth/cancelled-popup-request'
      ) {
        setError('Sign in failed. Please try again.')
      }
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans text-[#0F172A]">
      <Metadata
        title="VIREON — Earn from simple online tasks"
        description="Join VIREON, complete task modules, track your earnings and withdraw on your schedule."
      />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-[#E2E8F5] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <VireonLogo size={38} />
            <span className="text-xl font-black tracking-tight">
              <span className="text-[#2F80ED]">VI</span>
              <span className="text-[#0A1A3C]">REON</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#475569] md:flex">
            <a href="#modules" className="hover:text-[#0A1A3C]">
              Modules
            </a>
            <a href="#how" className="hover:text-[#0A1A3C]">
              How it works
            </a>
            <a href="#testimonials" className="hover:text-[#0A1A3C]">
              Reviews
            </a>
            <a href="#plans" className="hover:text-[#0A1A3C]">
              Plans
            </a>
            <a href="#faq" className="hover:text-[#0A1A3C]">
              FAQ
            </a>
          </nav>
          <button
            onClick={handleGetStarted}
            disabled={signingIn || loading}
            className="flex items-center gap-2 rounded-full bg-[#0A1A3C] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#07132B] active:scale-95 disabled:opacity-60"
          >
            {signingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Get Started
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#2F80ED]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-[#38BDF8]/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="anim-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D6E2F7] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2F80ED]">
              <Sparkles className="h-4 w-4" /> Task-based earning platform
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#0A1A3C] md:text-6xl">
              Turn small tasks into
              <span className="text-[#2F80ED]"> real payouts.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#475569]">
              VIREON brings your earning modules, task activity, wallet and
              withdrawal requests into one clean dashboard. Sign in, activate,
              and start completing tasks at your own pace.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleGetStarted}
                disabled={signingIn || loading}
                className="flex items-center justify-center gap-2 rounded-full bg-[#2F80ED] px-7 py-3.5 text-base font-black text-white transition hover:bg-[#1D6FE0] active:scale-95 disabled:opacity-60"
              >
                {signingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Globe2 className="h-5 w-5" />
                )}
                Continue with Google
              </button>
              <a
                href="#how"
                className="flex items-center justify-center gap-2 rounded-full border border-[#D6E2F7] bg-white px-7 py-3.5 text-base font-bold text-[#0A1A3C] transition hover:border-[#2F80ED]"
              >
                See how it works <ChevronDown className="h-5 w-5" />
              </a>
            </div>
            {error && (
              <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#64748B]">
              <span className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-[#2F80ED]" /> Google secured
              </span>
              <span className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#2F80ED]" /> No card required
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#2F80ED]" /> Member dashboard
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="anim-pop-in relative">
            <div className="rounded-[28px] border border-[#D6E2F7] bg-white p-5 shadow-2xl shadow-[#0A1A3C]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VireonLogo size={34} />
                  <div>
                    <p className="text-sm font-black text-[#0A1A3C]">
                      Welcome back, Amaka
                    </p>
                    <p className="text-[11px] text-[#64748B]">Starter plan</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E8F1FF] px-3 py-1 text-[10px] font-bold uppercase text-[#2F80ED]">
                  Active
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0A1A3C] p-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Available balance
                  </p>
                  <p className="mt-1 text-2xl font-black">₦42,500</p>
                </div>
                <div className="rounded-2xl bg-[#E8F1FF] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2F80ED]">
                    Pending withdrawal
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#0A1A3C]">
                    ₦10,000
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  'CallCash task completed',
                  'Survey submitted',
                  'Streak day 6',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F5] px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-[#334155]">
                      <CheckCircle2 className="h-4 w-4 text-[#2F80ED]" />
                      {item}
                    </span>
                    <span className="font-bold text-[#0A1A3C]">+₦500</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-[#D6E2F7] bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F80ED] text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Withdrawal</p>
                  <p className="text-sm font-black text-[#0A1A3C]">
                    Paid instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#E2E8F5] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {[
            ['6', 'Task modules'],
            ['24/7', 'Dashboard access'],
            ['Real-time', 'Withdrawal status'],
            ['1-tap', 'Google sign-in'],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-[#0A1A3C] md:text-3xl">
                {value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2F80ED]">
            Earning modules
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1A3C] md:text-4xl">
            One dashboard, every way to earn
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#475569]">
            Each module is designed to be short, clear and trackable. Pick what
            fits your schedule and see every completion in your history.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <div
              key={module.name}
              className="group rounded-2xl border border-[#E2E8F5] bg-white p-6 transition hover:-translate-y-1 hover:border-[#2F80ED] hover:shadow-xl hover:shadow-[#2F80ED]/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FF] text-[#2F80ED] transition group-hover:bg-[#2F80ED] group-hover:text-white">
                <module.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-[#0A1A3C]">
                {module.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-[#0A1A3C] py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#38BDF8]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              From sign-up to payout in four steps
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F80ED] text-xl font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="mx-auto max-w-6xl px-4 py-16 md:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2F80ED]">
            Member reviews
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1A3C] md:text-4xl">
            Built around real member feedback
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-[#E2E8F5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-1 text-[#2F80ED]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#334155]">
                “{t.quote}”
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A1A3C] text-sm font-black text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-black text-[#0A1A3C]">{t.name}</p>
                  <p className="text-xs text-[#64748B]">{t.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section
        id="plans"
        className="border-y border-[#E2E8F5] bg-white py-16 md:py-24"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2F80ED]">
              Plans
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1A3C] md:text-4xl">
              Start free, activate when ready
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[#E2E8F5] bg-[#F4F7FE] p-8">
              <h3 className="text-lg font-black text-[#0A1A3C]">Starter</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                Explore the dashboard and set up your profile.
              </p>
              <p className="mt-5 text-4xl font-black text-[#0A1A3C]">Free</p>
              <ul className="mt-6 space-y-3 text-sm text-[#334155]">
                {[
                  'Google account sign-in',
                  'Dashboard and profile',
                  'Notification centre',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2F80ED]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-3xl border-2 border-[#2F80ED] bg-[#0A1A3C] p-8 text-white shadow-2xl shadow-[#2F80ED]/20">
              <span className="absolute right-6 top-6 rounded-full bg-[#2F80ED] px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                Most popular
              </span>
              <h3 className="text-lg font-black">Activated</h3>
              <p className="mt-1 text-sm text-white/60">
                Unlock task modules and withdrawal requests.
              </p>
              <p className="mt-5 text-4xl font-black">
                ₦2,500
                <span className="text-base font-medium text-white/60">
                  /month
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/85">
                {[
                  'All earning modules',
                  'Task and activity history',
                  'Withdrawal requests',
                  'Priority notifications',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2F80ED]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1A3C] md:text-4xl">
            Questions, answered
          </h2>
        </div>
        <div className="mt-8 space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-[#E2E8F5] bg-white p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#0A1A3C]">
                {item.q}
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#2F80ED] to-[#0A1A3C] px-6 py-12 text-center text-white md:px-12 md:py-16">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">
            Ready to start earning with VIREON?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
            Create your account, complete your profile and activate your
            dashboard. Everything you need is in one place.
          </p>
          <button
            onClick={handleGetStarted}
            disabled={signingIn || loading}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-black text-[#0A1A3C] transition hover:bg-[#E8F1FF] active:scale-95 disabled:opacity-60"
          >
            {signingIn ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CreditCard className="h-5 w-5" />
            )}
            Get Started Free
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E8F5] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-[#64748B] sm:flex-row">
          <div className="flex items-center gap-2">
            <VireonLogo size={30} />
            <span className="font-black text-[#0A1A3C]">VIREON</span>
            <span>
              ©{' '}
              <button
                onClick={() => navigate(routes.adminLogin())}
                className="transition hover:text-[#0A1A3C]"
                aria-label="VIREON admin"
              >
                2026
              </button>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#modules" className="hover:text-[#0A1A3C]">
              Modules
            </a>
            <a href="#plans" className="hover:text-[#0A1A3C]">
              Plans
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
