import { prisma } from '../prisma'
import type { ApplicationType } from '../generated/prisma'

/**
 * Generate a unique application number
 * Format: SPK-{TYPE}-{YEAR}-{SEQUENCE}
 * Example: SPK-BH-2026-00001
 */
export async function generateApplicationNumber(type: ApplicationType): Promise<string> {
  const year = new Date().getFullYear()
  
  // Type prefix mapping
  const typePrefix: Record<ApplicationType, string> = {
    BORANG_H: 'BH',
    BORANG_G: 'BG',
    TADBIR_SUMPAH: 'TS'
  }
  
  const prefix = typePrefix[type]
  
  // Get the count of applications of this type in the current year
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)
  
  const count = await prisma.application.count({
    where: {
      type,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear
      }
    }
  })
  
  const sequence = (count + 1).toString().padStart(5, '0')
  
  return `SPK-${prefix}-${year}-${sequence}`
}

/**
 * Generate a unique payment number
 * Format: PAY-{YEAR}{MONTH}-{SEQUENCE}
 * Example: PAY-202601-00001
 */
export async function generatePaymentNumber(): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const yearMonth = `${year}${month}`
  
  // Get count of payments in current month
  const startOfMonth = new Date(year, now.getMonth(), 1)
  const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59)
  
  const count = await prisma.payment.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  })
  
  const sequence = (count + 1).toString().padStart(5, '0')
  
  return `PAY-${yearMonth}-${sequence}`
}

/**
 * Generate a unique certificate number
 * Format: CERT-{TYPE}-{YEAR}-{SEQUENCE}
 * Example: CERT-CIT-2026-00001
 */
export async function generateCertificateNumber(type: string): Promise<string> {
  const year = new Date().getFullYear()
  const typePrefix = type.substring(0, 3).toUpperCase()
  
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)
  
  const count = await prisma.certificate.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear
      }
    }
  })
  
  const sequence = (count + 1).toString().padStart(5, '0')
  
  return `CERT-${typePrefix}-${year}-${sequence}`
}
