import { createContext, ReactNode, useEffect, useState } from 'react'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from '../services/apiClient'
import Router from 'next/router'

// user type
type User = {
  email: string;
  permissions: string[];
  roles: string[],
}

type SignInCredentials = {
  email: string;
  password: string;
}

// thats the context value type
type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user?: User;
}

type AuthProviderProps = {
  children: ReactNode;
}

// create authChannel var with BroadcastChannel type
let authChannel: BroadcastChannel

// the signOut function
export function signOut() {
  // use nookies function called destroyCookie to delete the cookies
  destroyCookie(undefined, 'nextauth-ignite.token')
  destroyCookie(undefined, 'nextauth-ignite.refreshToken')

  // use broadcast channels to share user disconnected information in other open tabs
  authChannel.postMessage('signOut')
  
  // redirect user to login page
  Router.push('/')
}

export const AuthContext = createContext({} as AuthContextData)

// create the provider for auth context
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  // transform user var in boolean for return
  const isAuthenticated = !!user // false in the beginning

  // this useEffect is used to listen to broadcast channel events
  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    // event onmessage
    authChannel.onmessage = (message => {
      switch (message.data) {
        // at the case the message is equal to 'signOut', other tabs opened will execute signOut func too
        case 'signOut':
          signOut()
          break
        default: 
          break
      }
    })
  }, [])

  // this useEffect is getting user information from '/me' route in API
  useEffect(() => {
    // getting token from cookies with nookies lib func called parseCookies and renaming to token
    const { 'nextauth-ignite.token': token } = parseCookies()

    if (token) {
      api.get('me')
        .then(response => {
          const { email, permissions, roles } = response.data

          setUser({ email, permissions, roles })
        }).catch(() => {
          // in case of error, axios interceptors will take care of the situation, if not the case
          // then it's safer to log the user out of the app
          signOut()
        })
    }
  }, [])

  // that's the signIn func receiving user credentials
  async function signIn ({ email, password }: SignInCredentials) {
    try {
      // try creating new session with API route /sessions
      const response = await api.post('sessions', {
        email, password
      })

      const { token, refreshToken, permissions, roles } = response.data

      // setting cookies with nookies func called setCookie
      setCookie(undefined, 'nextauth-ignite.token', token, {
        maxAge: 60 * 60* 24 * 30, // 30 days
        path: '/'
      })
      setCookie(undefined, 'nextauth-ignite.refreshToken', refreshToken, {
        maxAge: 60 * 60* 24 * 30, // 30 days
        path: '/'
      })
  
      setUser({
        email, permissions, roles
      })

      // update api headers authorization to use the new token generated with refresh token functionality
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // redirect user to dashboard
      Router.push('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}