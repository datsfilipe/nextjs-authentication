import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { validateUserPermissions } from "../utils/validateUserPermissions"

type UseCanAccessParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCanAccess ({ permissions = [], roles = [] }: UseCanAccessParams) {
  // get auth information from context
  const { user, isAuthenticated } = useContext(AuthContext)

  // make sure user exist for typescript
  if (!user) return

  // obviously unauthenticated users can't see the content
  if (!isAuthenticated) {
    return false
  }

  // check user permissions
  const userHasValidUserPermissions = validateUserPermissions({
    user,
    permissions,
    roles
  })

  // return the boolean
  return userHasValidUserPermissions
}