import { useEffect, useState } from 'react'

import { collection, onSnapshot } from 'firebase/firestore'
import {
  Bell,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Users,
  Wallet,
} from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import VireonLogo from 'src/components/VireonLogo/VireonLogo'
import { db } from 'src/lib/firebase'

const AdminPortalPage = () => {
  const [users, setUsers] = useState(0)
  const [withdrawals, setWithdrawals] = useState(0)
  const [tasks, setTasks] = useState(0)
  const [help, setHelp] = useState(0)

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) =>
      setUsers(snap.size)
    )
    const unsubWithdrawals = onSnapshot(collection(db, 'withdrawals'), (snap) =>
      setWithdrawals(snap.size)
    )
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) =>
      setTasks(snap.size)
    )
    const unsubHelp = onSnapshot(collection(db, 'help'), (snap) =>
      setHelp(snap.size)
    )
    return () => {
      unsubUsers()
      unsubWithdrawals()
      unsubTasks()
      unsubHelp()
    }
  }, [])

  const tiles = [
    {
      label: 'Overview',
      detail: 'Live stats and recent sign-ups',
      to: routes.adminOverview(),
      icon: LayoutDashboard,
    },
    {
      label: `Users (${users})`,
      detail: 'Everyone who signed in',
      to: routes.adminUsers(),
      icon: Users,
    },
    {
      label: `Withdrawals (${withdrawals})`,
      detail: 'Review and settle requests',
      to: routes.adminWithdrawals(),
      icon: Wallet,
    },
    {
      label: `Tasks (${tasks})`,
      detail: 'Manage earning modules',
      to: routes.adminTasks(),
      icon: ListChecks,
    },
    {
      label: `Help (${help})`,
      detail: 'Support tickets from members',
      to: routes.adminHelp(),
      icon: HelpCircle,
    },
    {
      label: 'Notifications',
      detail: 'Broadcast messages to users',
      to: routes.adminNotifications(),
      icon: Bell,
    },
  ]

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans">
      <Metadata title="Admin Portal — VIREON" />

      <header className="bg-[#0A1A3C] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <VireonLogo size={40} />
            <div>
              <h1 className="text-2xl font-black">VIREON Admin</h1>
              <p className="text-xs text-white/60">
                Select a section to manage
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(routes.landing())}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <button
              key={tile.label}
              onClick={() => navigate(tile.to)}
              className="flex flex-col items-start gap-4 rounded-2xl border border-[#E2E8F5] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#2F80ED] hover:shadow-lg hover:shadow-[#2F80ED]/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1FF] text-[#2F80ED]">
                <tile.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-black text-[#0A1A3C]">
                  {tile.label}
                </p>
                <p className="text-sm text-[#64748B]">{tile.detail}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPortalPage
