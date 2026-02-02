import type { H3Event } from 'h3'
import type { UserRole } from '../generated/prisma'
import { getAuthenticatedUser } from './auth'

/**
 * Check if user has required role
 */
export function requireRole(event: H3Event, allowedRoles: UserRole[]) {
  const user = getAuthenticatedUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }
  
  if (!allowedRoles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      message: 'Insufficient permissions'
    })
  }
  
  return user
}

/**
 * Middleware factory to check for specific roles
 */
export function createRoleMiddleware(allowedRoles: UserRole[]) {
  return (event: H3Event) => requireRole(event, allowedRoles)
}

// Pre-defined role checkers
export const requirePemohon = (event: H3Event) => 
  requireRole(event, ['PEMOHON', 'ADMIN'])

export const requirePegawaiKonsul = (event: H3Event) => 
  requireRole(event, ['PEGAWAI_KONSUL', 'ADMIN'])

export const requirePegawaiPendaftaran = (event: H3Event) => 
  requireRole(event, ['PEGAWAI_PENDAFTARAN', 'ADMIN'])

export const requireAdmin = (event: H3Event) => 
  requireRole(event, ['ADMIN'])

export const requireOfficer = (event: H3Event) => 
  requireRole(event, ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'])
