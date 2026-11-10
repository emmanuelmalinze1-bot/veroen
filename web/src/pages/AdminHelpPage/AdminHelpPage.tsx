import { useEffect, useState } from 'react'

import { collection, onSnapshot } from 'firebase/firestore'
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react'

import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { db } from 'src/lib/firebase'

const formatDate = (ts: any) => {
  if (!ts) return 'No date'
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return isNaN(date.getTime()) ? 'No date' : date.toLocaleString()
}

const AdminHelpPage = () => {
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'help'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      setRequests(data)
    })
    return () => unsub()
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans">
      <Metadata title="Admin Help — VIREON" />

      <header className="bg-[#0A1A3C] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate(routes.admin())}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-black">Help Requests</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl border border-[#E2E8F5] bg-white p-6">
          {requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94A3B8]">
              No help requests yet.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-[#E2E8F5] p-4"
                >
                  <div className="mb-3 flex flex-col justify-between gap-2 border-b border-[#E2E8F5] pb-3 md:flex-row">
                    <p className="flex items-center gap-2 text-base font-bold text-[#0A1A3C]">
                      <Mail className="h-5 w-5 text-[#2F80ED]" />{' '}
                      {req.userEmail || 'Unknown email'}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <Clock className="h-4 w-4" /> {formatDate(req.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1">
                      <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-[#2F80ED]">
                        <HelpCircle className="h-4 w-4" /> Issue type
                      </p>
                      <p className="text-sm text-[#334155]">
                        {req.issueType || 'No issue selected'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-[#2F80ED]">
                        <Phone className="h-4 w-4" /> Phone number
                      </p>
                      <p className="text-sm text-[#334155]">
                        {req.userPhone || 'No phone provided'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-[#2F80ED]">
                        <MessageSquare className="h-4 w-4" /> Other details
                      </p>
                      <p className="break-words text-sm text-[#334155]">
                        {req.issueOther || 'No extra details'}
                      </p>
                    </div>
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

export default AdminHelpPage
