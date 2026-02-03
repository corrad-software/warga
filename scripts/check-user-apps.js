import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function checkUserApps() {
  try {
    // Get all PEMOHON users with their applications
    const users = await prisma.user.findMany({
      where: {
        role: 'PEMOHON'
      },
      include: {
        applications: {
          select: {
            id: true,
            applicationNumber: true,
            type: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    console.log('\n=== PEMOHON Users and Their Applications ===\n')

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`)
      console.log(`  Name: ${user.name}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  IC Number: ${user.icNumber || 'N/A'}`)
      console.log(`  Applications: ${user.applications.length}`)

      if (user.applications.length > 0) {
        console.log('  Application List:')
        user.applications.forEach(app => {
          console.log(`    - ${app.applicationNumber} | ${app.type} | ${app.status}`)
        })
      }
      console.log('')
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserApps()
