import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Initialize Prisma with the adapter
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Updating biometric status values...')

  // Update LENGKAP to SAH
  const sahResult = await prisma.biometric.updateMany({
    where: {
      status: 'LENGKAP'
    },
    data: {
      status: 'SAH',
      updatedBy: 'SYSTEM'
    }
  })

  console.log(`✓ Updated ${sahResult.count} records from LENGKAP to SAH`)

  // Update TIDAK_LENGKAP and TIDAK_HADIR to TIDAK SAH
  const tidakSahResult1 = await prisma.biometric.updateMany({
    where: {
      status: 'TIDAK_LENGKAP'
    },
    data: {
      status: 'TIDAK SAH',
      updatedBy: 'SYSTEM'
    }
  })

  const tidakSahResult2 = await prisma.biometric.updateMany({
    where: {
      status: 'TIDAK_HADIR'
    },
    data: {
      status: 'TIDAK SAH',
      updatedBy: 'SYSTEM'
    }
  })

  console.log(`✓ Updated ${tidakSahResult1.count + tidakSahResult2.count} records to TIDAK SAH`)

  // Summary
  const totalBiometrics = await prisma.biometric.count()
  const sahCount = await prisma.biometric.count({ where: { status: 'SAH' }})
  const tidakSahCount = await prisma.biometric.count({ where: { status: 'TIDAK SAH' }})
  const nullCount = await prisma.biometric.count({ where: { status: null }})

  console.log('\n========================================')
  console.log('Biometric Status Summary:')
  console.log('========================================')
  console.log(`Total Biometrics: ${totalBiometrics}`)
  console.log(`SAH:              ${sahCount}`)
  console.log(`TIDAK SAH:        ${tidakSahCount}`)
  console.log(`NULL:             ${nullCount}`)
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
