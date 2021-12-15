import axios, { AxiosError } from 'axios'
import { GetServerSidePropsContext } from 'next'
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext'
import { AuthTokenError } from './errors/AuthTokenError'

// to avoid using type any
type RequestFailedQueue = {
  resolve: (token: string) => void;
  reject: (error: AxiosError<any, any>) => void;
}[]
// failed process in queue that will wait the refresh of the token
let failedRequestQueue: RequestFailedQueue = []

// to control the execution time of refresh token functionality
let isRefreshing = false

// ctx undefined by default
export function setupApiClient (ctx: undefined | GetServerSidePropsContext = undefined) {
  // getting cookies with context
  let cookies = parseCookies(ctx)

  // creating api
  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth-ignite.token']}`
    }
  })
  
  // the axios interceptors function tracks an error on a failed API request
  // then treat it as in this case where the expired token error calls the token refresh functionality
  // and then the queued processes are executed with the refreshed token
  api.interceptors.response.use(response => {
    return response
    // axios error being treated
  }, (error: AxiosError) => {
    // if error response have status code '401', which normally means access denied
    if (error.response?.status === 401) {
      // if the error code that back-end gave was 'token.expired' | in this specific case
      if (error.response.data?.code === 'token.expired') {
        // get the cookies
        cookies = parseCookies(ctx)
  
        // get refreshToken
        const { 'nextauth-ignite.refreshToken': refreshToken }  = cookies
        const originalConfig = error.config
  
        // if isn't refreshing yet
        if (!isRefreshing) {
          // set is refreshing to true
          isRefreshing = true
  
          // post request to /refresh route in back-end sending the refreshToken
          api.post('refresh', {
            refreshToken,
          }).then(response => {
            // get the token from response
            const { token } = response.data
    
            // set the new token
            setCookie(ctx, 'nextauth-ignite.token', token, {
              maxAge: 60 * 60* 24 * 30, // 30 days
              path: '/'
            })
            // set the new refreshToken
            setCookie(ctx, 'nextauth-ignite.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60* 24 * 30, // 30 days
              path: '/'
            })

            // set the authorization API headers with the new token    
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  
            // execute the failed requests with the new token
            failedRequestQueue.forEach(request => request.resolve(token))
            // then clean the queue
            failedRequestQueue = []
          }).catch(error => {
            // execute the error method for failed requests queue
            failedRequestQueue.forEach(request => request.reject(error))
            // then clean the queue
            failedRequestQueue = []
  
            // make sure is being executed only in browser
            if (process.browser) {
              // then signOut()
              signOut()
            }
            // and finally set isRefreshing to false again, finishing the refresh token functionality in front-end
          }).finally(() => {
            isRefreshing = false
          })
        }
  
        // return a new Promise cause axios don't accept async function
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            resolve: (token: string) => {
              // be sure to typescript if older request config headers exist
              if (!originalConfig.headers) return
              // set the authorization header for the original requests in queue with the new token
              originalConfig.headers['Authorization'] = `Bearer ${token}`
  
              // execute the requests queued with the new token
              resolve(api(originalConfig))
            },
            // in error case, execute the reject method
            reject: (error: AxiosError) => {
              reject(error)
            }
          })
        })
      } else {
        // if the error isn't 'token.expired', it means that the user access was denied by other reasons
        // so signOut the user for security reasons
        // make sure signOut process is being executed in browser
        if (process.browser) {
          signOut()
        } else {
          // if isn't in browser, return the custom AuthTokenError
          return Promise.reject(new AuthTokenError())
        }
      }
    }
  
    // return the error in case none of other returns was called
    return Promise.reject(error)
  })

  // return api
  return api
}