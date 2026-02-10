import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function main() {
  console.log('Creating PEMOHON users...')

  const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })
  const prisma = new PrismaClient({ adapter })

  // Get PEMOHON role
  const pemohonRole = await prisma.role.findUnique({ where: { roleCode: 'PEMOHON' } })
  if (!pemohonRole) {
    throw new Error('PEMOHON role not found. Run seed-pemohon.ts first.')
  }
  console.log(`Found role: ${pemohonRole.roleName} (ID: ${pemohonRole.id})`)

  const hashedPassword = await hashPassword('Password123!')

  const users = [
    { email: 'siti.nurhaliza@example.my', name: 'Siti Nurhaliza' },
    { email: 'nurul.aina@example.my', name: 'Nurul Aina' },
    { email: 'applicant@test.com', name: 'Applicant' },
  ]

  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: 'PEMOHON',
        roleId: pemohonRole.id,
        password: hashedPassword,
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        isActive: true,
      },
      create: {
        name: u.name,
        fullName: u.name,
        email: u.email,
        password: hashedPassword,
        passwordHash: hashedPassword,
        role: 'PEMOHON',
        roleId: pemohonRole.id,
        status: 'ACTIVE',
        isActive: true,
        createdBy: 'SYSTEM',
      }
    })
    console.log(`  Created/updated: ${created.email} (Role: ${created.role}, Role ID: ${created.roleId})`)
  }

  await prisma['$disconnect']()
  console.log(`\nDone! 3 PEMOHON users created successfully.`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
