import { Roles } from '../types/globals'
import { useAuth } from '@clerk/clerk-react'

export const useCheckRole = async (role: Roles): Promise<boolean> => {
  const { getToken } = useAuth()
  try {
    const token = await getToken({ template: 'user-role' })
    return token?.includes(role) || false
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

// Helper function to check if user has agistor role
export const useIsAgistor = async (): Promise<boolean> => {
  return await useCheckRole('agistor')
}

// Helper function to check if user has admin role
export const useIsAdmin = async (): Promise<boolean> => {
  return await useCheckRole('admin')
}
