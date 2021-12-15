// custom error extending the node error
export class AuthTokenError extends Error {
  constructor () {
    super('Error with authentication token')
  }
}