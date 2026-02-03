import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function checkAdmin() {
  try {
    console.log('\n=== All Users by Role ===\n')

    const roles = ['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'PEMOHON']

    for (const role of roles) {
      const users = await prisma.user.findMany({
        where: { role },
        select: {
          name: true,
          email: true,
          role: true
        }
      })

      if (users.length > 0) {
        console.log(`${role}:`)
        users.forEach(user => {
          console.log(`  - ${user.name} (${user.email})`)
        })
        console.log('')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
