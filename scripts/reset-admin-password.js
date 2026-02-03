import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcrypt'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function resetAdminPassword() {
  console.log('Resetting admin password...\n')

  try {
    const newPassword = 'Admin123!'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const admin = await prisma.user.update({
      where: {
        email: 'admin@spk.gov.my'
      },
      data: {
        password: hashedPassword
      }
    })

    console.log('✓ Admin password has been reset!')
    console.log('\n=== Admin Login Credentials ===')
    console.log('Email:', admin.email)
    console.log('Password:', newPassword)
    console.log('\nYou can now log in at: http://localhost:3000/login')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
