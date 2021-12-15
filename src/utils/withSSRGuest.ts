import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { parseCookies } from "nookies"

// again a lot of typescript stuff to learn
export function withSSRGuest<P> (fn: GetServerSideProps<P>): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    // get cookies
    const cookies = parseCookies(ctx)

    // if token exists, redirect to dashboard page
    if (cookies['nextauth-ignite.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      }
    }
    
    // execute the main ssr function
    return await fn(ctx)
  }
}