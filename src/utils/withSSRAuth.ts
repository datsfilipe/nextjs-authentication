import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { destroyCookie, parseCookies } from 'nookies'
import { validateUserPermissions } from './validateUserPermissions'
import { AuthTokenError } from '../services/errors/AuthTokenError'
import decode from 'jwt-decode'

// options type
type WithSSRAuthOptions = {
  permissions: string[];
  roles: string[];
}

// that's a lot of typescript stuff to know
export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    // when getting cookies from nookies in ssr, the first param of the parseCookies function have to be the context
    const cookies = parseCookies(ctx)

    // store in token var a specific cookie
    const token = cookies['nextauth-ignite.token']

    // if the cookie doesn't exists, redirect user to login page
    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    // else, if the options are present
    if (options) {
      // decode the jwt cookie using 'jwt-decode' lib
      // also just type the necessary things
      const user = decode<{ permissions: string[], roles: string[] }>(token)
      const { permissions, roles } = options

      // call validation function with params
      const userHasValidUserPermissions = validateUserPermissions({
        user,
        permissions,
        roles
      })

      // if the user doesn't have permissions, redirect to a page where all users have permissions
      if (!userHasValidUserPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }

    // now a try catch block to execute the main ssr function
    try {
      return await fn(ctx)
    } catch (error) {
      // if the error corresponds to AuthTokenError, handle the situation
      if (error instanceof AuthTokenError) {
        // deleting cookies
        destroyCookie(ctx, 'nextauth-ignite.token')
        destroyCookie(ctx, 'nextauth-ignite.refreshToken')
        
        // redirect to login page
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
    // just to pass typescript error about missing final return
    return { notFound: true }
  }
}