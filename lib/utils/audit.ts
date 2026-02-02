import { prisma } from '../prisma'
import type { AuditAction } from '../generated/prisma'

interface CreateAuditLogParams {
  userId?: string
  action: AuditAction
  entityType: string
  entityId?: string
  changes?: any
  metadata?: any
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an audit log entry
 * This ensures all system actions are tracked immutably
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId || null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId || null,
      changes: params.changes || null,
      metadata: params.metadata || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null
    }
  })
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsForEntity(
  entityType: string,
  entityId: string,
  limit: number = 50
) {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    }
  })
}

/**
 * Get audit logs for a specific user
 */
export async function getAuditLogsForUser(userId: string, limit: number = 50) {
  return prisma.auditLog.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}
