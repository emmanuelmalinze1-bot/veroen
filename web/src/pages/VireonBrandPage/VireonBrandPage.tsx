import { ChevronLeft } from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import VireonLogo from 'src/components/VireonLogo/VireonLogo'

const VireonBrandPage = () => {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#0A1A3C] font-sans">
      <Metadata title="VIREON Brand" />

      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/10 bg-[#0A1A3C] p-4 text-white">
        <button
          onClick={() => navigate(routes.home())}
          className="rounded-full p-1 hover:bg-white/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">Brand</h1>
      </div>

      <div className="flex flex-col items-center justify-center p-10 text-center">
        <VireonLogo size={280} />

        <h2 className="mt-6 text-3xl font-black text-white">Our Brand</h2>
        <p className="mt-2 max-w-xs text-sm text-white/70">
          Simple tasks, clear payouts. VIREON keeps earning organised and
          transparent from sign-up to withdrawal.
        </p>

        <div className="mt-10 w-full max-w-xs rounded-2xl bg-white/10 p-5 text-left backdrop-blur">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">
            Brand Colors
          </p>

          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-[#0A1A3C] ring-1 ring-white/40" />
            <span className="text-sm font-bold text-white">#0A1A3C — Navy</span>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-[#2F80ED]" />
            <span className="text-sm font-bold text-white">
              #2F80ED — Electric Blue
            </span>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-[#38BDF8]" />
            <span className="text-sm font-bold text-white">#38BDF8 — Sky</span>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-[#F4F7FE]" />
            <span className="text-sm font-bold text-white">#F4F7FE — Mist</span>
          </div>
        </div>

        <p className="mt-8 text-[10px] tracking-wider text-white/40">
          VIREON © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default VireonBrandPage
