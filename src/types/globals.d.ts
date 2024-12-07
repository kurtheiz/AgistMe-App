export {}

// Create a type for the roles
export type Roles = 'agistor' | 'admin'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}
