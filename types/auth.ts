import type { UserRole, NationalityStatus, BiometricStatus } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  nationalityStatus: NationalityStatus
  biometricStatus: BiometricStatus
  isActive: boolean
  emailVerified: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phoneNumber?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

declare module 'h3' {
  interface H3EventContext {
    user?: AuthUser
  }
}
