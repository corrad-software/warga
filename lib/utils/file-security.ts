/**
 * File Security Utilities
 *
 * Provides file validation and security checks to prevent:
 * - MIME type spoofing
 * - Malicious file uploads
 * - Invalid file formats
 */

/**
 * File signatures (magic numbers) for supported file types
 */
const FILE_SIGNATURES = {
  // PDF
  'application/pdf': {
    signature: [0x25, 0x50, 0x44, 0x46], // %PDF
    offset: 0
  },
  // JPEG
  'image/jpeg': {
    signature: [0xFF, 0xD8, 0xFF],
    offset: 0
  },
  'image/jpg': {
    signature: [0xFF, 0xD8, 0xFF],
    offset: 0
  },
  // PNG
  'image/png': {
    signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    offset: 0
  },
  // Microsoft Word (.doc)
  'application/msword': {
    signature: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
    offset: 0
  },
  // Microsoft Word (.docx) - ZIP-based
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    signature: [0x50, 0x4B, 0x03, 0x04], // PK.. (ZIP header)
    offset: 0
  }
}

/**
 * Validate file signature matches declared MIME type
 */
export function validateFileSignature(
  buffer: Buffer,
  declaredMimeType: string
): boolean {
  const signatureInfo = FILE_SIGNATURES[declaredMimeType as keyof typeof FILE_SIGNATURES]

  if (!signatureInfo) {
    // Unknown MIME type - reject for safety
    return false
  }

  const { signature, offset } = signatureInfo

  // Check if buffer is large enough
  if (buffer.length < offset + signature.length) {
    return false
  }

  // Compare signatures
  for (let i = 0; i < signature.length; i++) {
    if (buffer[offset + i] !== signature[i]) {
      return false
    }
  }

  return true
}

/**
 * Detect MIME type from file buffer by analyzing file signature
 */
export function detectMimeType(buffer: Buffer): string | null {
  // Check against all known signatures
  for (const [mimeType, { signature, offset }] of Object.entries(FILE_SIGNATURES)) {
    if (buffer.length < offset + signature.length) {
      continue
    }

    let match = true
    for (let i = 0; i < signature.length; i++) {
      if (buffer[offset + i] !== signature[i]) {
        match = false
        break
      }
    }

    if (match) {
      return mimeType
    }
  }

  return null
}

/**
 * Validate file integrity - ensures declared MIME matches actual file content
 */
export function validateFileIntegrity(
  buffer: Buffer,
  declaredMimeType: string
): {
  valid: boolean
  detectedMimeType: string | null
  error?: string
} {
  // Detect actual MIME type from file content
  const detectedMimeType = detectMimeType(buffer)

  if (!detectedMimeType) {
    return {
      valid: false,
      detectedMimeType: null,
      error: 'Unable to detect file type from content'
    }
  }

  // Normalize MIME types for comparison (jpg vs jpeg)
  const normalizedDeclared = declaredMimeType.replace('image/jpg', 'image/jpeg')
  const normalizedDetected = detectedMimeType.replace('image/jpg', 'image/jpeg')

  // Check if declared matches detected
  if (normalizedDeclared !== normalizedDetected) {
    return {
      valid: false,
      detectedMimeType,
      error: `File type mismatch: declared as ${declaredMimeType} but detected as ${detectedMimeType}`
    }
  }

  return {
    valid: true,
    detectedMimeType
  }
}

/**
 * Check if file size is within acceptable limits
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): {
  valid: boolean
  error?: string
} {
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(fileSize)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
    }
  }

  if (fileSize === 0) {
    return {
      valid: false,
      error: 'File is empty'
    }
  }

  return { valid: true }
}

/**
 * Format file size for human readability
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory separators and null bytes
  let sanitized = filename
    .replace(/\.\./g, '') // Remove ..
    .replace(/[\/\\]/g, '') // Remove / and \
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[<>:"|?*]/g, '') // Remove invalid Windows characters
    .trim()

  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = 'unnamed-file'
  }

  return sanitized
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Validate file extension matches MIME type
 */
export function validateFileExtension(
  filename: string,
  mimeType: string
): boolean {
  const ext = getFileExtension(filename)

  const validExtensions: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
  }

  const allowed = validExtensions[mimeType]
  return allowed ? allowed.includes(ext) : false
}

/**
 * Comprehensive file validation
 */
export function validateUploadedFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  maxSize?: number
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Validate file size
  const sizeCheck = validateFileSize(buffer.length, maxSize)
  if (!sizeCheck.valid) {
    errors.push(sizeCheck.error!)
  }

  // 2. Validate file extension
  if (!validateFileExtension(filename, mimeType)) {
    warnings.push(`File extension may not match MIME type ${mimeType}`)
  }

  // 3. Validate file signature/integrity
  const integrityCheck = validateFileIntegrity(buffer, mimeType)
  if (!integrityCheck.valid) {
    errors.push(integrityCheck.error!)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
