import { useEffect, useState } from 'react'

import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { Gift, Loader2 } from 'lucide-react'

import { useAuth } from 'src/contexts/AuthContexts'
import { getActivationAmount } from 'src/lib/activation'
import { db } from 'src/lib/firebase'

const money = (value: number) => `₦${(value || 0).toLocaleString('en-NG')}`

const ActivationRewardPopup = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [claiming, setClaiming] = useState(false)
  const rewardAmount = getActivationAmount(profile)

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null)
      return
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : null)
    })
    return () => unsub()
  }, [user])

  const claimReward = async () => {
    if (!user?.uid || claiming) return
    setClaiming(true)
    try {
      await setDoc(doc(db, 'submissions', `activation-reward-${user.uid}`), {
        userId: user.uid,
        userEmail: user.email || '',
        userName: profile?.name || user.displayName || '',
        taskName: 'Activation reward',
        taskCategory: 'Reward',
        payout: rewardAmount,
        status: 'completed',
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'users', user.uid), {
        rewardPending: false,
        rewardClaimed: true,
        rewardAmount,
      })
    } catch (err) {
      console.error('Reward claim failed:', err)
    } finally {
      setClaiming(false)
    }
  }

  if (!profile?.rewardPending || profile?.rewardClaimed) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1A3C]/70 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Gift className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-black text-[#0A1A3C]">
          Activation complete
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Your account is now active. Tap the money below to claim your reward.
        </p>
        <button
          onClick={claimReward}
          disabled={claiming}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8F1FF] py-4 text-3xl font-black text-[#2F80ED] transition hover:bg-[#dbeafe] disabled:opacity-60"
        >
          {claiming ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            money(rewardAmount)
          )}
        </button>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
          {claiming
            ? 'Adding to your balance...'
            : `Claim your ${money(rewardAmount)} back`}
        </p>
      </div>
    </div>
  )
}

export default ActivationRewardPopup
