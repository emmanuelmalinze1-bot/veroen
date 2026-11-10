import { useEffect, useState } from 'react'

import { collection, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, Eye, Mail, MoreVertical, Phone, Search } from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { db } from 'src/lib/firebase'

const formatDate = (ts: any) => {
  if (!ts) return 'No date'
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return isNaN(date.getTime()) ? 'No date' : date.toLocaleString()
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.lastLogin?.seconds || 0) - (a.lastLogin?.seconds || 0)
      )
      setUsers(data)
    })
    return () => unsub()
  }, [])

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans">
      <Metadata title="Admin Users — VIREON" />

      <header className="bg-[#0A1A3C] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate(routes.admin())}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black">Users ({users.length})</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#E2E8F5] bg-white px-4 py-3">
          <Search className="h-4 w-4 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or phone..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E2E8F5] bg-white">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94A3B8]">
              {users.length === 0
                ? 'No users have signed in yet.'
                : 'No users match your search.'}
            </p>
          ) : (
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-7 gap-2 border-b border-[#E2E8F5] bg-[#F4F7FE] px-4 py-3 text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                <div className="col-span-2">Name / Email</div>
                <div>Phone</div>
                <div>Country</div>
                <div>Plan</div>
                <div>Last login</div>
                <div className="text-center">Action</div>
              </div>

              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-7 items-center gap-2 border-b border-[#E2E8F5] px-4 py-3 text-sm hover:bg-[#F4F7FE]/60"
                >
                  <div className="col-span-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold text-[#0A1A3C]">
                        {u.name || 'Unknown'}
                      </p>
                      <span
                        className={`rounded-sm px-1.5 py-0.5 text-[9px] font-black uppercase ${
                          u.activated
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-[#E8F1FF] text-[#2F80ED]'
                        }`}
                      >
                        {u.activated ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="flex items-center gap-1 truncate text-xs text-[#64748B]">
                      <Mail className="h-3 w-3 shrink-0" /> {u.email}
                    </p>
                  </div>
                  <div className="truncate text-[#334155]">
                    <p className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3 shrink-0 text-[#94A3B8]" />
                      {u.phone || 'No phone'}
                    </p>
                  </div>
                  <div className="truncate text-[#334155]">
                    {u.country || '—'}
                  </div>
                  <div className="truncate capitalize text-[#334155]">
                    {u.plan || 'starter'}
                  </div>
                  <div className="truncate text-xs text-[#94A3B8]">
                    {formatDate(u.lastLogin)}
                  </div>
                  <div className="relative flex justify-center">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === u.id ? null : u.id)
                      }
                      className="rounded-full p-2 hover:bg-[#E8F1FF]"
                    >
                      <MoreVertical className="h-5 w-5 text-[#94A3B8]" />
                    </button>
                    {openMenuId === u.id && (
                      <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-[#E2E8F5] bg-white p-1 shadow-lg">
                        <button
                          onClick={() => {
                            setOpenMenuId(null)
                            navigate(routes.adminUserDetail({ id: u.id }))
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-[#0A1A3C] hover:bg-[#E8F1FF]"
                        >
                          <Eye className="h-4 w-4 text-[#2F80ED]" /> View
                          details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
