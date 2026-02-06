import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const id = parseInt(event.context.params?.id as string)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID tidak sah'
      })
    }
    
    const preApplication = await prisma.preApplication.findUnique({
      where: { id },
      include: {
        applicant: {
          include: {
            parents: true,
            children: true,
            siblings: true,
          }
        },
        applications: {
          select: {
            id: true,
            applicationNumber: true,
            status: true,
            createdAt: true,
          }
        }
      }
    })
    
    if (!preApplication) {
      throw createError({
        statusCode: 404,
        message: 'Pra-permohonan tidak dijumpai'
      })
    }
    
    return {
      success: true,
      data: {
        preApplication
      }
    }
  } catch (error: any) {
    console.error('Get pra-permohonan detail error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal mendapatkan butiran pra-permohonan'
    })
  }
})
