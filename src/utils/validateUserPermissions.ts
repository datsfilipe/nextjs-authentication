// user type - only type what you will use
type User = {
  permissions: string[];
  roles: string[];
}

// validate user permissions func params typed
type ValidateUserPermissionsParams = {
  user: User;
  permissions: string[];
  roles: string[];
}

export function validateUserPermissions ({
  user,
  permissions,
  roles
}: ValidateUserPermissionsParams) {
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every(permission => {
      return user.permissions.includes(permission)
    })

    // if user don't have all the needed permissions, then his access is denied
    if (!hasAllPermissions) {
      return false
    }
  }

  if (roles?.length > 0) {
    const hasNeededRoles = roles.some(role => {
      return user.roles.includes(role)
    })

    // if user don't have none of the needed roles, then his access is denied
    if (!hasNeededRoles) {
      console.log('aqui')
      return false
    }
  }

  // if the user passes the validation, his access is accepted
  return true
}