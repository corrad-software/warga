import { prisma } from '../prisma'
import Tesseract from 'tesseract.js'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'

/**
 * OCR Service - Document text extraction using Tesseract.js
 *
 * This service provides OCR capabilities for extracting text from images and PDFs
 */

export interface OCRResult {
  success: boolean
  text?: string
  confidence?: number
  metadata?: {
    documentType?: string
    detectedFields?: Record<string, any>
    language?: string
    pageCount?: number
  }
  error?: string
}

export interface ExtractedDocumentData {
  // Birth Certificate
  fullName?: string
  dateOfBirth?: string
  placeOfBirth?: string
  certificateNumber?: string

  // Passport
  passportNumber?: string
  nationality?: string
  issuedDate?: string
  expiryDate?: string

  // IC
  icNumber?: string
  icName?: string

  // Generic
  documentNumber?: string
  issuingAuthority?: string
  [key: string]: any
}

/**
 * Convert PDF page to image buffer
 */
async function pdfPageToImage(pdfPath: string, pageNumber: number = 0): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(path.join(process.cwd(), pdfPath))
  const pdfDoc = await PDFDocument.load(pdfBytes)

  // For now, we'll just read the PDF as-is since Tesseract can handle it
  // In production, you'd want to render PDF pages to images using pdf2pic or similar
  return pdfBytes
}

/**
 * Process document with OCR using Tesseract.js
 */
export async function processDocumentOCR(
  filePath: string,
  documentType: string
): Promise<OCRResult> {
  try {
    console.log(`[OCR] Processing document: ${filePath}`)
    console.log(`[OCR] Document type: ${documentType}`)

    const fullPath = path.join(process.cwd(), filePath)

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        error: 'File not found'
      }
    }

    const fileExt = path.extname(filePath).toLowerCase()
    let ocrText = ''
    let confidence = 0
    let pageCount = 1

    // Process based on file type
    if (fileExt === '.pdf') {
      // For PDFs, we need to extract pages as images first
      // For now, we'll use Tesseract directly on the PDF (limited support)
      // In production, use pdf2pic or similar to convert pages to images
      console.log('[OCR] Processing PDF (basic mode)')

      try {
        const result = await Tesseract.recognize(fullPath, 'eng+msa', {
          logger: m => console.log('[OCR Progress]', m)
        })

        ocrText = result.data.text
        confidence = result.data.confidence / 100
      } catch (pdfError) {
        console.warn('[OCR] PDF direct processing failed, treating as image fallback')
        // Fallback: try to process as image
        const result = await Tesseract.recognize(fullPath, 'eng', {
          logger: m => console.log('[OCR Progress]', m)
        })
        ocrText = result.data.text
        confidence = result.data.confidence / 100
      }
    } else {
      // Process images directly
      console.log('[OCR] Processing image')
      const result = await Tesseract.recognize(fullPath, 'eng+msa', {
        logger: m => console.log('[OCR Progress]', m)
      })

      ocrText = result.data.text
      confidence = result.data.confidence / 100
    }

    // Extract structured data based on document type
    const extractedFields = extractDocumentData(ocrText, documentType)

    return {
      success: true,
      text: ocrText,
      confidence,
      metadata: {
        documentType,
        language: 'eng+msa',
        pageCount,
        detectedFields: extractedFields
      }
    }
  } catch (error: any) {
    console.error('OCR processing error:', error)
    return {
      success: false,
      error: error.message || 'OCR processing failed'
    }
  }
}

/**
 * Extract structured data from OCR text based on document type
 */
export function extractDocumentData(
  ocrText: string,
  documentType: string
): ExtractedDocumentData {
  const extractedData: ExtractedDocumentData = {}

  try {
    // Clean up OCR text
    const cleanText = ocrText.replace(/\s+/g, ' ').trim()

    switch (documentType) {
      case 'BIRTH_CERTIFICATE':
        // Extract birth certificate fields using regex patterns
        // Name patterns
        const nameMatch = cleanText.match(/(?:name|nama)[:\s]+([A-Z\s]+)/i)
        if (nameMatch) extractedData.fullName = nameMatch[1].trim()

        // Date of birth patterns
        const dobMatch = cleanText.match(/(?:date of birth|tarikh lahir)[:\s]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i)
        if (dobMatch) extractedData.dateOfBirth = dobMatch[1]

        // Certificate number
        const certMatch = cleanText.match(/(?:certificate|sijil)[:\s]*(?:no|number)?[:\s]*([A-Z0-9-]+)/i)
        if (certMatch) extractedData.certificateNumber = certMatch[1]

        break

      case 'PASSPORT':
        // Extract passport fields
        // Passport number (typically 1-2 letters followed by 6-9 digits)
        const passportMatch = cleanText.match(/(?:passport|pasport)[:\s]*(?:no|number)?[:\s]*([A-Z]{1,2}\d{6,9})/i)
        if (passportMatch) extractedData.passportNumber = passportMatch[1]

        // Nationality
        const nationalityMatch = cleanText.match(/(?:nationality|kewarganegaraan)[:\s]+([A-Z\s]+)/i)
        if (nationalityMatch) extractedData.nationality = nationalityMatch[1].trim()

        // Expiry date
        const expiryMatch = cleanText.match(/(?:date of expiry|tarikh luput)[:\s]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i)
        if (expiryMatch) extractedData.expiryDate = expiryMatch[1]

        break

      case 'IC_PARENTS':
        // Extract IC (Identity Card) fields
        // Malaysian IC format: YYMMDD-PB-###G
        const icMatch = cleanText.match(/(\d{6}-\d{2}-\d{4})/)||
          cleanText.match(/(\d{12})/) // Also match without dashes

        if (icMatch) extractedData.icNumber = icMatch[1]

        // Name on IC
        const icNameMatch = cleanText.match(/(?:name|nama)[:\s]+([A-Z\s]+)/i)
        if (icNameMatch) extractedData.icName = icNameMatch[1].trim()

        break

      default:
        // Generic extraction - look for common patterns
        // Document numbers
        const docNumberMatch = cleanText.match(/(?:document|no|number)[:\s]*([A-Z0-9-]+)/i)
        if (docNumberMatch) extractedData.documentNumber = docNumberMatch[1]

        break
    }

    return extractedData
  } catch (error) {
    console.error('Data extraction error:', error)
    return {}
  }
}

/**
 * Queue document for OCR processing
 */
export async function queueDocumentForOCR(
  documentId: string
): Promise<boolean> {
  try {
    // Update document status to OCR_PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: {
        verificationStatus: 'OCR_PROCESSING'
      }
    })

    // Get document details
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return false
    }

    // Process OCR (in production, this would be queued to a job system)
    const ocrResult = await processDocumentOCR(
      document.filePath,
      document.documentType
    )

    if (ocrResult.success) {
      // Extract structured data
      const extractedData = extractDocumentData(
        ocrResult.text || '',
        document.documentType
      )

      // Update document with OCR results
      await prisma.document.update({
        where: { id: documentId },
        data: {
          verificationStatus: 'OCR_COMPLETED',
          ocrResult: {
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            metadata: ocrResult.metadata,
            extractedData
          },
          ocrProcessedAt: new Date()
        }
      })

      return true
    } else {
      // Mark as requiring manual check
      await prisma.document.update({
        where: { id: documentId },
        data: {
          verificationStatus: 'REQUIRES_MANUAL_CHECK',
          verificationNotes: `OCR failed: ${ocrResult.error}`
        }
      })

      return false
    }
  } catch (error) {
    console.error('OCR queue error:', error)
    return false
  }
}

/**
 * Validate OCR results against application data
 */
export function validateOCRData(
  extractedData: ExtractedDocumentData,
  applicationData: any
): {
  isValid: boolean
  mismatches: string[]
  warnings: string[]
} {
  const mismatches: string[] = []
  const warnings: string[] = []

  // TODO: Implement validation logic
  // Compare extracted data with application data
  // Flag any mismatches or suspicious data

  return {
    isValid: mismatches.length === 0,
    mismatches,
    warnings
  }
}

/**
 * OCR Providers - Different OCR service implementations
 */
export const OCRProviders = {
  /**
   * Tesseract.js - Open source OCR
   */
  async tesseract(filePath: string): Promise<OCRResult> {
    try {
      const fullPath = path.join(process.cwd(), filePath)

      const result = await Tesseract.recognize(fullPath, 'eng+msa', {
        logger: m => console.log('[Tesseract]', m)
      })

      return {
        success: true,
        text: result.data.text,
        confidence: result.data.confidence / 100,
        metadata: {
          language: 'eng+msa',
          pageCount: 1
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Tesseract OCR failed'
      }
    }
  },

  /**
   * Google Vision API
   */
  async googleVision(filePath: string): Promise<OCRResult> {
    // TODO: Implement Google Vision API
    // npm install @google-cloud/vision
    return {
      success: false,
      error: 'Google Vision integration not implemented'
    }
  },

  /**
   * AWS Textract
   */
  async awsTextract(filePath: string): Promise<OCRResult> {
    // TODO: Implement AWS Textract
    // npm install @aws-sdk/client-textract
    return {
      success: false,
      error: 'AWS Textract integration not implemented'
    }
  },

  /**
   * Azure Computer Vision
   */
  async azureVision(filePath: string): Promise<OCRResult> {
    // TODO: Implement Azure Computer Vision
    // npm install @azure/cognitiveservices-computervision
    return {
      success: false,
      error: 'Azure Vision integration not implemented'
    }
  }
}
