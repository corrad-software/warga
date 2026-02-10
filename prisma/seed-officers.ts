import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function seedDatabase(dbPath: string) {
  console.log(`\nSeeding database: ${dbPath}`)
  const adapter = new PrismaLibSql({ url: dbPath })
  const prisma = new PrismaClient({ adapter })

  // Create OFFICERS role in roles table
  const officersRole = await prisma.role.upsert({
    where: { roleCode: 'OFFICERS' },
    update: {},
    create: {
      roleCode: 'OFFICERS',
      roleName: 'Officers',
      createdBy: 'SYSTEM',
    }
  })
  console.log(`Role created/found: ${officersRole.roleName} (ID: ${officersRole.id})`)

  // Hash the password
  const hashedPassword = await hashPassword('Password123!')

  // Create Officer user
  const officerUser = await prisma.user.upsert({
    where: { email: 'officer@spk.gov.my' },
    update: {
      name: 'Officer',
      password: hashedPassword,
      passwordHash: hashedPassword,
      roleId: officersRole.id,
      role: 'PEGAWAI_KONSUL',
      status: 'ACTIVE',
      isActive: true,
    },
    create: {
      name: 'Officer',
      fullName: 'Officer',
      email: 'officer@spk.gov.my',
      password: hashedPassword,
      passwordHash: hashedPassword,
      roleId: officersRole.id,
      role: 'PEGAWAI_KONSUL',
      status: 'ACTIVE',
      isActive: true,
      createdBy: 'SYSTEM',
    }
  })

  // Create Registrar user
  const registrarUser = await prisma.user.upsert({
    where: { email: 'registrar@spk.gov.my' },
    update: {
      name: 'Registrar',
      password: hashedPassword,
      passwordHash: hashedPassword,
      roleId: officersRole.id,
      role: 'PEGAWAI_PENDAFTARAN',
      status: 'ACTIVE',
      isActive: true,
    },
    create: {
      name: 'Registrar',
      fullName: 'Registrar',
      email: 'registrar@spk.gov.my',
      password: hashedPassword,
      passwordHash: hashedPassword,
      roleId: officersRole.id,
      role: 'PEGAWAI_PENDAFTARAN',
      status: 'ACTIVE',
      isActive: true,
      createdBy: 'SYSTEM',
    }
  })

  await prisma['$disconnect']()
  return { officersRole, officerUser, registrarUser }
}

async function main() {
  console.log('Creating OFFICERS role and users...')

  // Seed both database files to ensure data is available everywhere
  const result1 = await seedDatabase('file:./prisma/dev.db')
  const result2 = await seedDatabase('file:./dev.db')

  const { officersRole, officerUser, registrarUser } = result1

  console.log(`\n========================================`)
  console.log(`OFFICERS role and users created successfully!`)
  console.log(`========================================`)
  console.log(`Role: ${officersRole.roleName} (Code: ${officersRole.roleCode})`)
  console.log(`----------------------------------------`)
  console.log(`User 1:`)
  console.log(`  Name:     ${officerUser.name}`)
  console.log(`  Email:    ${officerUser.email}`)
  console.log(`  Role:     ${officerUser.role}`)
  console.log(`  Role ID:  ${officerUser.roleId}`)
  console.log(`  Status:   ${officerUser.status}`)
  console.log(`----------------------------------------`)
  console.log(`User 2:`)
  console.log(`  Name:     ${registrarUser.name}`)
  console.log(`  Email:    ${registrarUser.email}`)
  console.log(`  Role:     ${registrarUser.role}`)
  console.log(`  Role ID:  ${registrarUser.roleId}`)
  console.log(`  Status:   ${registrarUser.status}`)
  console.log(`========================================`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
