import type { NextPage } from 'next'
import { AuthContext } from '../contexts/AuthContext'
import { withSSRGuest } from '../utils/withSSRGuest'
import { FormEvent, useContext, useState } from 'react'

import styles from '../styles/signIn.module.css'

const SignIn: NextPage = () => {
  // using states to manipulate user input information
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { signIn } = useContext(AuthContext)

  async function handleSubmit (event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password,
    }

    // sign in with the user data
    await signIn(data)
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <label className={styles.inputLabel} htmlFor="email">E-mail</label>
      <input
        className={styles.inputContainer}
        name="email"
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <label className={styles.inputLabel} htmlFor="password">Password</label>
      <input
        className={styles.inputContainer}
        name="password"
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button title="Sign in" className={styles.button} type="submit">
        Login
      </button>
    </form>
  )
}

export default SignIn

// all SSR functionality is being performed by this function
export const getServerSideProps = withSSRGuest(async (ctx) => {
  // standard for next.js, have to return this
  return { props: {} }
})
