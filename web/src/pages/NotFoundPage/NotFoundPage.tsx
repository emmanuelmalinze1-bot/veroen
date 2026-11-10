import { Compass } from 'lucide-react'

import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import VireonLogo from 'src/components/VireonLogo/VireonLogo'

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A1A3C] px-6 text-center font-sans">
      <Metadata title="Page not found — VIREON" />
      <VireonLogo size={72} />
      <p className="mt-6 text-5xl font-black text-[#38BDF8]">404</p>
      <h1 className="mt-2 text-2xl font-black text-white">
        This page does not exist
      </h1>
      <p className="mt-2 max-w-sm text-sm text-white/60">
        The link may be broken or the page may have moved. Head back to your
        dashboard to continue.
      </p>
      <Link
        to={routes.home()}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2F80ED] px-6 py-3 text-sm font-black text-white transition hover:bg-[#1D6FE0]"
      >
        <Compass className="h-4 w-4" /> Back to dashboard
      </Link>
    </div>
  )
}

export default NotFoundPage
