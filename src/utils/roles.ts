import { Roles } from '../types/globals'
import { useAuth } from '@clerk/clerk-react'

export const useCheckRole = (role: Roles): boolean => {
  const { sessionClaims } = useAuth()
  return sessionClaims?.metadata?.role === role
}

// Helper function to check if user has agistor role
export const useIsAgistor = (): boolean => {
  return useCheckRole('agistor')
}

// Helper function to check if user has admin role
export const useIsAdmin = (): boolean => {
  return useCheckRole('admin')
}
