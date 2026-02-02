import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcrypt'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

const sampleUsers = [
  {
    name: 'Ahmad Bin Abdullah',
    email: 'ahmad.abdullah@example.my',
    password: 'Password123!',
    role: 'PEMOHON',
    icNumber: '901234-01-5678',
    phoneNumber: '+60123456789',
    address: 'No. 15, Jalan Merdeka 3/2, Taman Melati, 53100 Kuala Lumpur',
    dateOfBirth: new Date('1990-12-04'),
    placeOfBirth: 'Kuala Lumpur, Malaysia'
  },
  {
    name: 'Siti Nurhaliza Binti Hassan',
    email: 'siti.nurhaliza@example.my',
    password: 'Password123!',
    role: 'PEMOHON',
    icNumber: '850615-08-2341',
    phoneNumber: '+60127654321',
    address: 'Lot 234, Jalan Sultan Ismail, Bukit Bintang, 50250 Kuala Lumpur',
    dateOfBirth: new Date('1985-06-15'),
    placeOfBirth: 'Penang, Malaysia'
  },
  {
    name: 'Lim Wei Chen',
    email: 'lim.weichen@example.my',
    password: 'Password123!',
    role: 'PEGAWAI_KONSUL',
    icNumber: '880923-14-7890',
    phoneNumber: '+60198765432',
    address: '88, Jalan Genting Klang, Setapak, 53300 Kuala Lumpur',
    dateOfBirth: new Date('1988-09-23'),
    placeOfBirth: 'Ipoh, Perak, Malaysia'
  },
  {
    name: 'Rajesh Kumar A/L Subramaniam',
    email: 'rajesh.kumar@example.my',
    password: 'Password123!',
    role: 'PEGAWAI_PENDAFTARAN',
    icNumber: '921105-10-3456',
    phoneNumber: '+60167891234',
    address: 'No. 42, Jalan Klang Lama, Taman Desa, 58100 Kuala Lumpur',
    dateOfBirth: new Date('1992-11-05'),
    placeOfBirth: 'Klang, Selangor, Malaysia'
  },
  {
    name: 'Nurul Aina Binti Ismail',
    email: 'nurul.aina@example.my',
    password: 'Password123!',
    role: 'PEMOHON',
    icNumber: '950807-03-1234',
    phoneNumber: '+60134567890',
    address: 'Blok A-12-5, Pangsapuri Sri Rampai, Jalan 34/26, Wangsa Maju, 53300 Kuala Lumpur',
    dateOfBirth: new Date('1995-08-07'),
    placeOfBirth: 'Johor Bahru, Johor, Malaysia'
  }
]

async function seedUsers() {
  console.log('Starting to seed Malaysian users...')

  for (const userData of sampleUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      })

      console.log(`✓ Created user: ${user.name} (${user.email})`)
    } catch (error) {
      console.error(`✗ Failed to create user ${userData.email}:`, error.message)
    }
  }

  console.log('\nSeeding completed!')
  await prisma.$disconnect()
}

seedUsers()
