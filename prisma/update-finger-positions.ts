import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Initialize Prisma with the adapter
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

// Finger positions
const fingerPositions = [
  'IBU_JARI_KANAN',
  'JARI_TELUNJUK_KANAN',
  'JARI_TENGAH_KANAN',
  'JARI_MANIS_KANAN',
  'JARI_KELINGKING_KANAN',
  'IBU_JARI_KIRI',
  'JARI_TELUNJUK_KIRI',
  'JARI_TENGAH_KIRI',
  'JARI_MANIS_KIRI',
  'JARI_KELINGKING_KIRI'
]

// Helper function to get random item from array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

async function main() {
  console.log('Populating finger_position for biometric records...')

  // Get all biometric records
  const biometrics = await prisma.biometric.findMany({
    where: {
      fingerPosition: null
    }
  })

  console.log(`Found ${biometrics.length} biometric records without finger_position`)

  let updatedCount = 0

  for (const biometric of biometrics) {
    // Assign a random finger position
    const fingerPosition = randomItem(fingerPositions)
    
    await prisma.biometric.update({
      where: { id: biometric.id },
      data: {
        fingerPosition: fingerPosition,
        updatedBy: 'SYSTEM'
      }
    })
    updatedCount++
  }

  console.log(`✓ Updated ${updatedCount} biometric records`)

  // Summary
  const totalBiometrics = await prisma.biometric.count()
  const biometricsByFinger = await prisma.$queryRaw`
    SELECT finger_position, COUNT(*) as count 
    FROM biometrics 
    GROUP BY finger_position
  ` as any[]

  console.log('\n========================================')
  console.log('Biometric Finger Position Summary:')
  console.log('========================================')
  console.log(`Total Biometric Records: ${totalBiometrics}`)
  console.log('\nBy Finger Position:')
  biometricsByFinger.forEach((row: any) => {
    if (row.finger_position) {
      console.log(`  ${row.finger_position}: ${row.count}`)
    } else {
      console.log(`  (Unset): ${row.count}`)
    }
  })
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
