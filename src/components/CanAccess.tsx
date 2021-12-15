import { ReactNode } from 'react';
import { useCanAccess } from '../hooks/useCanAccess'

interface CanAccessProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}

export function CanAccess ({ children, permissions, roles }: CanAccessProps) {
  // test permissions with useCanAccess hook
  const useCanSeeComponent = useCanAccess({
    permissions, roles
  })

  // if user can't see the component, return null to avoid this
  if (!useCanSeeComponent) {
    return null
  }

  // if user can see, return the children component
  return (
    <>
      {children}
    </>
  )
}