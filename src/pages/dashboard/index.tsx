// this is a page that authenticated users can access
import { useContext } from 'react'
import { CanAccess } from '../../components/CanAccess'
import { AuthContext } from '../../contexts/AuthContext'
import { withSSRAuth } from '../../utils/withSSRAuth'
import Link from 'next/link'

import styles from './styles.module.css'

export default function Dashboard () {
  const { user, signOut } = useContext(AuthContext)

  return (
    <div className={styles.container}>
      <h1 className={styles.titlePage}>DASHBOARD</h1>
      <strong className={styles.successMessage}>
        Hello user from account: <span className={styles.email}>{user?.email}</span>, you are successfully logged in.
      </strong>
      <a title="Sign out" className={styles.button} onClick={signOut }>
        Sing out
      </a>
      {/* using the can access component to verify permissions */}
      <CanAccess permissions={['metrics.list']}>
        <Link href="/metrics">
          <a className={styles.permissionCheckTip}>
            You can access /metrics route!
          </a>
        </Link>
      </CanAccess>
    </div>
  )
}

// next.js server-side functions or static functions can be given a context prop
// ctx is the context, the type for this is: GetServerSidePropsContext
// this is the function that will be executed in SSR
export const getServerSideProps = withSSRAuth(async (ctx) => {
  // any code here will be executed after verifying user authentication
  // that's what the withSSRAuth function is doing
  // default return for next.js ssr functions
  return { props: {} }
})