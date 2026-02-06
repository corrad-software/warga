import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Initialize Prisma with the adapter
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

// Helper function for random date
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to get random item from array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Education levels
const educationLevels = [
  'DARJAH 6',
  'PMR',
  'SPM',
  'STPM',
  'DIPLOMA',
  'IJAZAH SARJANA MUDA',
  'IJAZAH SARJANA',
  'PHD'
]

// Sample institutions
const institutions = {
  'DARJAH 6': ['SK Taman Desa', 'SK Bandar Baru', 'SK Taman Melati', 'SK Bukit Bintang'],
  'PMR': ['SMK Taman Desa', 'SMK Bandar Baru', 'SMK Taman Melati', 'SMK Bukit Bintang'],
  'SPM': ['SMK Taman Desa', 'SMK Bandar Baru', 'SMK Taman Melati', 'SMK Bukit Bintang', 'SMK Damansara Jaya'],
  'STPM': ['SM Sains Selangor', 'SM Sains Kuala Lumpur', 'SMKA Kajang', 'Kolej MARA'],
  'DIPLOMA': ['Politeknik Shah Alam', 'Politeknik Kuala Lumpur', 'Kolej Komuniti', 'UNISEL'],
  'IJAZAH SARJANA MUDA': ['Universiti Malaya', 'Universiti Kebangsaan Malaysia', 'Universiti Putra Malaysia', 'Universiti Teknologi Malaysia', 'Universiti Sains Malaysia'],
  'IJAZAH SARJANA': ['Universiti Malaya', 'Universiti Kebangsaan Malaysia', 'Universiti Putra Malaysia'],
  'PHD': ['Universiti Malaya', 'Universiti Kebangsaan Malaysia']
}

// Certificate names by level
const certificates = {
  'DARJAH 6': ['Sijil Pelajaran Rendah'],
  'PMR': ['Sijil Penilaian Menengah Rendah'],
  'SPM': ['Sijil Pelajaran Malaysia'],
  'STPM': ['Sijil Tinggi Persekolahan Malaysia', 'Matrikulasi'],
  'DIPLOMA': ['Diploma Kejuruteraan', 'Diploma Perniagaan', 'Diploma Teknologi Maklumat', 'Diploma Perakaunan'],
  'IJAZAH SARJANA MUDA': ['Ijazah Sarjana Muda Kejuruteraan', 'Ijazah Sarjana Muda Perniagaan', 'Ijazah Sarjana Muda Sains', 'Ijazah Sarjana Muda Sastera'],
  'IJAZAH SARJANA': ['Ijazah Sarjana Kejuruteraan', 'Ijazah Sarjana Perniagaan', 'Ijazah Sarjana Sains'],
  'PHD': ['Doktor Falsafah (PhD) Kejuruteraan', 'Doktor Falsafah (PhD) Sains']
}

async function main() {
  console.log('Seeding education data...')

  // Get all applicants
  const applicants = await prisma.applicant.findMany({
    select: { id: true, fullName: true }
  })

  console.log(`Found ${applicants.length} applicants`)

  let totalEducation = 0

  for (const applicant of applicants) {
    // Each applicant will have 2-4 education records
    const numRecords = Math.floor(Math.random() * 3) + 2 // 2 to 4
    
    // Determine highest education level (index in educationLevels array)
    const highestLevel = Math.min(Math.floor(Math.random() * educationLevels.length), 7)
    
    // Create education records from lowest to highest
    for (let i = 0; i <= highestLevel && i < numRecords; i++) {
      const level = educationLevels[i]
      const institution = randomItem(institutions[level as keyof typeof institutions])
      const certificate = randomItem(certificates[level as keyof typeof certificates])
      
      // Calculate dates based on level
      const baseYear = 1995 + (i * 3) // Stagger education years
      const startDate = new Date(baseYear + Math.floor(Math.random() * 5), 0, 1)
      const duration = level === 'PHD' ? 4 : level === 'IJAZAH SARJANA' ? 2 : level === 'IJAZAH SARJANA MUDA' ? 3 : level === 'DIPLOMA' ? 3 : level === 'STPM' ? 2 : 3
      const endDate = new Date(startDate.getFullYear() + duration, 11, 31)
      
      await prisma.education.create({
        data: {
          applicantId: applicant.id,
          certificateName: certificate,
          startDate: startDate,
          endDate: endDate,
          educationLevel: level,
          institutionName: institution,
          createdBy: 'SYSTEM'
        }
      })
      totalEducation++
    }
  }

  console.log(`✓ Created ${totalEducation} education records`)

  // Summary
  const educationCount = await prisma.education.count()
  const educationByLevel = await prisma.$queryRaw`
    SELECT education_level, COUNT(*) as count 
    FROM education 
    GROUP BY education_level
  ` as any[]

  console.log('\n========================================')
  console.log('Education Summary:')
  console.log('========================================')
  console.log(`Total Education Records: ${educationCount}`)
  console.log('\nBy Level:')
  educationByLevel.forEach((row: any) => {
    console.log(`  ${row.education_level}: ${row.count}`)
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
