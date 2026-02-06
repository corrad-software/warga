import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id) {
      return {
        success: false,
        message: 'ID biometrik tidak sah'
      }
    }

    // Check if biometric exists
    const biometric = await prisma.biometric.findUnique({
      where: { id }
    })

    if (!biometric) {
      return {
        success: false,
        message: 'Rekod biometrik tidak dijumpai'
      }
    }

    // Delete the biometric record
    await prisma.biometric.delete({
      where: { id }
    })

    return {
      success: true,
      message: 'Rekod biometrik berjaya dipadam'
    }
  } catch (error: any) {
    console.error('Error deleting biometric:', error)
    return {
      success: false,
      message: 'Ralat semasa memadam rekod biometrik',
      error: error.message
    }
  }
})
