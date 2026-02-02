import { prisma } from '../prisma'
import { queueDocumentForOCR } from './ocr'

/**
 * OCR Worker Service
 *
 * Manages background OCR processing queue and status
 * In production, this would integrate with BullMQ or similar job queue
 */

export interface OCRJobStatus {
  documentId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress?: number
  error?: string
  startedAt?: Date
  completedAt?: Date
}

// In-memory job tracker (in production, use Redis or database)
const jobQueue: Map<string, OCRJobStatus> = new Map()

/**
 * Process OCR queue - processes all pending documents
 */
export async function processOCRQueue(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  try {
    // Find all documents pending OCR processing
    const pendingDocuments = await prisma.document.findMany({
      where: {
        verificationStatus: {
          in: ['PENDING', 'OCR_PROCESSING']
        }
      },
      take: 10 // Process in batches
    })

    let processed = 0
    let succeeded = 0
    let failed = 0

    for (const doc of pendingDocuments) {
      try {
        console.log(`[OCR Worker] Processing document ${doc.id}`)

        // Update job status
        jobQueue.set(doc.id, {
          documentId: doc.id,
          status: 'PROCESSING',
          startedAt: new Date()
        })

        // Process OCR
        const success = await queueDocumentForOCR(doc.id)

        processed++

        if (success) {
          succeeded++
          jobQueue.set(doc.id, {
            documentId: doc.id,
            status: 'COMPLETED',
            completedAt: new Date()
          })
        } else {
          failed++
          jobQueue.set(doc.id, {
            documentId: doc.id,
            status: 'FAILED',
            error: 'OCR processing failed',
            completedAt: new Date()
          })
        }
      } catch (error) {
        console.error(`[OCR Worker] Error processing document ${doc.id}:`, error)
        failed++
        jobQueue.set(doc.id, {
          documentId: doc.id,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        })
      }
    }

    return { processed, succeeded, failed }
  } catch (error) {
    console.error('[OCR Worker] Queue processing error:', error)
    return { processed: 0, succeeded: 0, failed: 0 }
  }
}

/**
 * Retry failed OCR processing for a specific document
 */
export async function retryFailedOCR(documentId: string): Promise<boolean> {
  try {
    // Reset document status to PENDING
    await prisma.document.update({
      where: { id: documentId },
      data: {
        verificationStatus: 'PENDING',
        verificationNotes: null,
        ocrResult: null,
        ocrProcessedAt: null
      }
    })

    // Reset job status
    jobQueue.set(documentId, {
      documentId,
      status: 'PENDING'
    })

    // Queue for processing
    return await queueDocumentForOCR(documentId)
  } catch (error) {
    console.error(`[OCR Worker] Retry failed for document ${documentId}:`, error)
    return false
  }
}

/**
 * Get OCR processing status for a document
 */
export function getOCRStatus(documentId: string): OCRJobStatus | null {
  return jobQueue.get(documentId) || null
}

/**
 * Get all jobs in queue
 */
export function getAllJobs(): OCRJobStatus[] {
  return Array.from(jobQueue.values())
}

/**
 * Clear completed jobs from memory
 */
export function clearCompletedJobs(): number {
  let cleared = 0

  for (const [documentId, job] of jobQueue.entries()) {
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      // Keep jobs for 1 hour after completion
      const completedAt = job.completedAt
      if (completedAt && Date.now() - completedAt.getTime() > 3600000) {
        jobQueue.delete(documentId)
        cleared++
      }
    }
  }

  return cleared
}

/**
 * Start OCR worker - processes queue periodically
 * In production, use a proper job queue like BullMQ
 */
export function startOCRWorker(intervalMs: number = 60000): NodeJS.Timer {
  console.log('[OCR Worker] Starting OCR worker...')

  const interval = setInterval(async () => {
    console.log('[OCR Worker] Processing queue...')
    const result = await processOCRQueue()
    console.log(`[OCR Worker] Batch complete: ${result.processed} processed, ${result.succeeded} succeeded, ${result.failed} failed`)

    // Clean up old jobs
    const cleared = clearCompletedJobs()
    if (cleared > 0) {
      console.log(`[OCR Worker] Cleared ${cleared} completed jobs from memory`)
    }
  }, intervalMs)

  return interval
}

/**
 * Stop OCR worker
 */
export function stopOCRWorker(interval: NodeJS.Timer): void {
  clearInterval(interval)
  console.log('[OCR Worker] OCR worker stopped')
}

/**
 * Process a single document immediately (bypass queue)
 */
export async function processSingleDocument(documentId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    jobQueue.set(documentId, {
      documentId,
      status: 'PROCESSING',
      startedAt: new Date()
    })

    const success = await queueDocumentForOCR(documentId)

    if (success) {
      jobQueue.set(documentId, {
        documentId,
        status: 'COMPLETED',
        completedAt: new Date()
      })

      return { success: true }
    } else {
      jobQueue.set(documentId, {
        documentId,
        status: 'FAILED',
        error: 'OCR processing failed',
        completedAt: new Date()
      })

      return { success: false, error: 'OCR processing failed' }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    jobQueue.set(documentId, {
      documentId,
      status: 'FAILED',
      error: errorMessage,
      completedAt: new Date()
    })

    return { success: false, error: errorMessage }
  }
}
