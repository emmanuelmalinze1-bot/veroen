// src/contexts/AuthContexts.tsx
import {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

import { auth, db } from 'src/lib/firebase'

export interface AuthContextType {
  googleSignIn: () => Promise<User | null>
  logOut: () => Promise<void>
  user: User | null
  currentUser: User | null
  isAuthenticated: boolean
  loading: boolean
  hasRole?: (roles?: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      console.log(
        'Firebase Auth State:',
        currentUser ? `Logged in as ${currentUser.email}` : 'Logged out'
      )
    })
    return () => unsubscribe()
  }, [])

  const googleSignIn = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, provider)
      setUser(result.user)
      setLoading(false)

      // Save the signed-in user to the 'users' collection. New accounts get
      // VIREON defaults; returning users keep their existing plan/activation.
      if (result.user) {
        const userRef = doc(db, 'users', result.user.uid)
        const existing = await getDoc(userRef)
        await setDoc(
          userRef,
          {
            name: result.user.displayName || 'User',
            email: result.user.email || '',
            uid: result.user.uid,
            lastLogin: serverTimestamp(),
            ...(existing.exists()
              ? {}
              : {
                  plan: 'starter',
                  activated: false,
                  phone: '',
                  country: '',
                  createdAt: serverTimestamp(),
                }),
          },
          { merge: true }
        )
      }

      return result.user
    } catch (error) {
      setLoading(false)
      console.error('Error during google sign-in:', error)
      throw error
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Error during sign out:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    googleSignIn,
    logOut,
    user,
    currentUser: user,
    isAuthenticated: !!user,
    loading,
    hasRole: () => true,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider')
  }
  return context
}
