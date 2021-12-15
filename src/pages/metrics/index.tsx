// this is a page that will only be accessible to authenticated users with specific permissions
import { withSSRAuth } from "../../utils/withSSRAuth"
import styles from './styles.module.css'

export default function Metrics () {

  return (
    <div>
      <h1 className={styles.titlePage}>Metrics</h1>
    </div>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return { props: {} }
}, {
  // there are the options to check user permissions
  permissions: 
    ['metrics.list'],
  roles: 
    ['administrator']
})