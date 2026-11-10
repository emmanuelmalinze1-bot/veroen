import React, { useState, useEffect } from 'react'

import { collection, doc, onSnapshot } from 'firebase/firestore'
import { User, Home, ListChecks, Wallet, Bell } from 'lucide-react'

import { Link, navigate, routes, useLocation } from '@redwoodjs/router'

import VireonLogo from 'src/components/VireonLogo/VireonLogo'
import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'

const MainLayout = ({ children }) => {
  const { user } = useAuth()

  const [totalNotifs, setTotalNotifs] = useState(0)
  const [readCount, setReadCount] = useState(0)

  // Count total notifications: broadcasts (no targetEmail) + this user's own
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      const visible = snap.docs
        .map((d) => d.data() as any)
        .filter((n) => !n.targetEmail || n.targetEmail === user?.email)
      setTotalNotifs(visible.length)
    })
    return () => unsub()
  }, [user])

  // Count how many the user has read
  useEffect(() => {
    if (!user?.uid) {
      setReadCount(0)
      return
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const readIds = snap.data()?.readNotifications || []
      setReadCount(readIds.length)
    })
    return () => unsub()
  }, [user])

  const unreadCount = Math.max(0, totalNotifs - readCount)

  const { pathname } = useLocation()
  const headerTitle =
    pathname === '/tasks'
      ? 'Task Modules'
      : pathname === '/withdraw'
        ? 'Withdraw'
        : pathname === '/activate'
          ? 'Activate'
          : pathname === '/profile'
            ? 'Profile'
            : pathname === '/notifications'
              ? 'Notifications'
              : pathname === '/brand'
                ? 'Brand'
                : null

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F4F7FE] font-sans text-[#0F172A] antialiased">
      <header className="sticky top-0 z-40 bg-[#0A1A3C] text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={routes.home()} className="flex items-center gap-1.5">
            <VireonLogo size={38} />
            <span className="text-2xl font-black tracking-tight">
              {headerTitle ? (
                <span className="text-white">{headerTitle}</span>
              ) : (
                <>
                  <span className="text-[#38BDF8]">VI</span>
                  <span className="text-white">REON</span>
                </>
              )}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={routes.notifications()}
              className="relative rounded-full p-2"
            >
              <Bell className="h-5 w-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2F80ED] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-20">{children}</main>

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center">
        <nav className="pointer-events-auto w-full max-w-md border-t border-[#1B2C55] bg-[#0A1A3C] text-white">
          <div className="grid grid-cols-4 py-2">
            <button
              onClick={() => navigate(routes.home())}
              className="flex flex-col items-center text-[10px]"
            >
              <Home className="h-5 w-5" /> Home
            </button>
            <button
              onClick={() => navigate(routes.tasks())}
              className="flex flex-col items-center text-[10px]"
            >
              <ListChecks className="h-5 w-5" /> Tasks
            </button>
            <button
              onClick={() => navigate(routes.withdraw())}
              className="flex flex-col items-center text-[10px]"
            >
              <Wallet className="h-5 w-5" /> Withdraw
            </button>
            <button
              onClick={() => navigate(routes.profile())}
              className="flex flex-col items-center text-[10px]"
            >
              <User className="h-5 w-5" /> Profile
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default MainLayout
