import { useState } from 'react'

import { Loader2, Lock, Mail, ShieldAlert } from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

const ADMIN_EMAIL = 'maziemeka6@gmail.com'

const AdminLoginPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (email.trim().toLowerCase() === ADMIN_EMAIL) {
      navigate(routes.admin())
    } else {
      setError('Access denied. Only the admin can enter.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FE] p-4 font-sans">
      <Metadata title="Admin Login — VIREON" />

      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F5] bg-white p-8 shadow-2xl shadow-[#0A1A3C]/10">
        <div className="mb-6 flex flex-col items-center text-center">
          <p className="text-3xl font-black tracking-tight">
            <span className="text-[#2F80ED]">VI</span>
            <span className="text-[#0A1A3C]">REON</span>
          </p>
          <h1 className="mt-4 text-2xl font-black text-[#0A1A3C]">
            Admin access
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Restricted area. Authorized personnel only.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
            <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Admin email
            </span>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
                className="w-full rounded-xl border border-[#E2E8F5] bg-[#F4F7FE] py-3 pl-10 pr-4 text-sm font-medium text-[#0A1A3C] outline-none focus:border-[#2F80ED]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A1A3C] py-3 text-sm font-black text-white transition hover:bg-[#07132B] active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {isLoading ? 'Checking...' : 'Unlock dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(routes.landing())}
            className="text-xs font-bold text-[#94A3B8] hover:text-[#2F80ED]"
          >
            Back to store
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
