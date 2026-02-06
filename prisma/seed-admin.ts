import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcrypt'

// Initialize Prisma with the adapter - use the same database as the project
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
})
const prisma = new PrismaClient({ adapter })

const SALT_ROUNDS = 10

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function main() {
  console.log('Creating admin role and user...')

  // Create Admin role in roles table
  const adminRole = await prisma.role.upsert({
    where: { roleCode: 'ADMIN' },
    update: {},
    create: {
      roleCode: 'ADMIN',
      roleName: 'Administrator',
      createdBy: 'SYSTEM',
    }
  })
  console.log(`Role created/found: ${adminRole.roleName} (ID: ${adminRole.id})`)

  // Hash the password
  const hashedPassword = await hashPassword('Admin123!')

  // Create Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@spk.gov.my' },
    update: {
      name: 'Admin',
      password: hashedPassword,
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      isActive: true,
    },
    create: {
      name: 'Admin',
      fullName: 'Admin',
      email: 'admin@spk.gov.my',
      password: hashedPassword,
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      isActive: true,
      createdBy: 'SYSTEM',
    }
  })
  
  console.log(`\n========================================`)
  console.log(`Admin user created successfully!`)
  console.log(`========================================`)
  console.log(`Name:     ${adminUser.name}`)
  console.log(`Email:    ${adminUser.email}`)
  console.log(`Role:     ${adminUser.role}`)
  console.log(`Role ID:  ${adminUser.roleId}`)
  console.log(`Status:   ${adminUser.status}`)
  console.log(`========================================`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
