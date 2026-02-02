import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { validateUploadedFile, sanitizeFilename } from './file-security'

export interface UploadedFile {
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
}

export interface UploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  subFolder?: string
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

/**
 * Save uploaded file to storage
 */
export async function saveUploadedFile(
  fileData: Buffer,
  fileName: string,
  mimeType: string,
  options: UploadOptions = {}
): Promise<UploadedFile> {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    subFolder = 'documents'
  } = options

  // Validate file size
  if (fileData.length > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`)
  }

  // Validate mime type
  if (!allowedTypes.includes(mimeType)) {
    throw new Error(`File type ${mimeType} is not allowed`)
  }

  // Validate file integrity and security
  const securityCheck = validateUploadedFile(fileData, fileName, mimeType, maxSize)
  if (!securityCheck.valid) {
    throw new Error(`File validation failed: ${securityCheck.errors.join(', ')}`)
  }

  // Log warnings if any
  if (securityCheck.warnings.length > 0) {
    console.warn('File upload warnings:', securityCheck.warnings)
  }

  // Sanitize filename
  const sanitizedFileName = sanitizeFilename(fileName)

  // Generate unique filename
  const timestamp = Date.now()
  const hash = createHash('md5').update(fileData).digest('hex').substring(0, 8)
  const ext = path.extname(sanitizedFileName)
  const baseName = path.basename(sanitizedFileName, ext)
  const uniqueFileName = `${baseName}-${timestamp}-${hash}${ext}`

  // Create storage directory if it doesn't exist
  const storageDir = path.join(process.cwd(), 'storage', subFolder)
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }

  // Save file
  const filePath = path.join(storageDir, uniqueFileName)
  fs.writeFileSync(filePath, fileData)

  // Return relative path for database storage
  const relativePath = path.join('storage', subFolder, uniqueFileName)

  return {
    fileName: uniqueFileName,
    filePath: relativePath,
    fileSize: fileData.length,
    mimeType
  }
}

/**
 * Delete file from storage
 */
export function deleteFile(filePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

/**
 * Get file from storage
 */
export function getFile(filePath: string): Buffer | null {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath)
    }
    return null
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
}

/**
 * Parse multipart form data to extract file
 */
export async function parseMultipartFile(event: any): Promise<{
  file: Buffer
  fileName: string
  mimeType: string
  fields: Record<string, any>
}> {
  const contentType = event.node.req.headers['content-type']

  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data')
  }

  // Read raw body
  const chunks: Buffer[] = []
  for await (const chunk of event.node.req) {
    chunks.push(chunk)
  }
  const body = Buffer.concat(chunks)

  // Extract boundary
  const boundaryMatch = contentType.match(/boundary=(.+)$/)
  if (!boundaryMatch) {
    throw new Error('No boundary found in Content-Type')
  }
  const boundary = '--' + boundaryMatch[1]

  // Split by boundary
  const parts = body.toString('binary').split(boundary).filter(part => part.trim() && part !== '--')

  let file: Buffer | null = null
  let fileName = ''
  let mimeType = ''
  const fields: Record<string, any> = {}

  for (const part of parts) {
    const [headerSection, ...bodyParts] = part.split('\r\n\r\n')
    const bodyContent = bodyParts.join('\r\n\r\n').replace(/\r\n$/, '')

    const dispositionMatch = headerSection.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/)
    if (!dispositionMatch) continue

    const fieldName = dispositionMatch[1]
    const fieldFileName = dispositionMatch[2]

    if (fieldFileName) {
      // This is a file field
      const typeMatch = headerSection.match(/Content-Type: (.+)/)
      mimeType = typeMatch ? typeMatch[1].trim() : 'application/octet-stream'
      fileName = fieldFileName
      file = Buffer.from(bodyContent, 'binary')
    } else {
      // This is a regular field
      fields[fieldName] = bodyContent.trim()
    }
  }

  if (!file) {
    throw new Error('No file found in request')
  }

  return {
    file,
    fileName,
    mimeType,
    fields
  }
}
