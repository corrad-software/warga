import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') || '0')
    const body = await readBody(event)
    const { status, remarks, verifiedBy } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID dokumen diperlukan'
      })
    }

    if (!status) {
      throw createError({
        statusCode: 400,
        message: 'Status pengesahan diperlukan'
      })
    }

    // Update document verification status
    const document = await prisma.document.update({
      where: { id },
      data: {
        status,
        remarks: remarks || null,
        verifiedBy: verifiedBy || null,
        verifiedAt: status === 'DISAHKAN' || status === 'TIDAK_DISAHKAN' ? new Date() : null,
        updatedBy: 'SYSTEM',
      }
    })

    return {
      success: true,
      data: document,
      message: 'Status dokumen berjaya dikemaskini'
    }
  } catch (error: any) {
    console.error('Error updating document verification:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Gagal mengemaskini status dokumen'
    })
  }
})
