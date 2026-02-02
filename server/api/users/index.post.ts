import { prisma } from '~/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    // Get authorization token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const token = authHeader.substring(7)

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      throw createError({
        statusCode: 401,
        message: 'Invalid token'
      })
    }

    // Check if user is admin or officer
    if (!['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(decoded.role)) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden - Admin or Officer access required'
      })
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.email || !body.name || !body.password) {
      throw createError({
        statusCode: 400,
        message: 'Email, name, and password are required'
      })
    }

    // Validate password length
    if (body.password.length < 8) {
      throw createError({
        statusCode: 400,
        message: 'Password must be at least 8 characters long'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format'
      })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Prepare user data
    const userData: any = {
      email: body.email,
      name: body.name,
      password: hashedPassword,
      role: body.role || 'PEMOHON'
    }

    // Add optional fields if provided
    if (body.icNumber) userData.icNumber = body.icNumber
    if (body.phoneNumber) userData.phoneNumber = body.phoneNumber
    if (body.address) userData.address = body.address
    if (body.placeOfBirth) userData.placeOfBirth = body.placeOfBirth
    if (body.dateOfBirth) userData.dateOfBirth = new Date(body.dateOfBirth)

    // Create user
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        icNumber: true,
        phoneNumber: true,
        address: true,
        dateOfBirth: true,
        placeOfBirth: true,
        role: true,
        nationalityStatus: true,
        isActive: true,
        createdAt: true
      }
    })

    return {
      success: true,
      data: { user },
      message: 'User created successfully'
    }
  } catch (error: any) {
    console.error('Error creating user:', error)

    if (error.statusCode) {
      throw error
    }

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        message: 'Email or IC number already exists'
      })
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create user'
    })
  }
})
