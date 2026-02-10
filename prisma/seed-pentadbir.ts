import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

async function main() {
  const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })
  const prisma = new PrismaClient({ adapter })

  const role = await prisma.role.upsert({
    where: { roleCode: 'PENTADBIR_SISTEM_IT' },
    update: {},
    create: {
      roleCode: 'PENTADBIR_SISTEM_IT',
      roleName: 'Pentadbir Sistem / IT',
      createdBy: 'SYSTEM',
    }
  })
  console.log(`Role created/found: ${role.roleName} (ID: ${role.id})`)

  const hashedPassword = await bcrypt.hash('Password123!', SALT_ROUNDS)

  const user = await prisma.user.upsert({
    where: { email: 'admin_it@spk.gov.my' },
    update: {
      role: 'PENTADBIR_SISTEM_IT',
      roleId: role.id,
      password: hashedPassword,
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      isActive: true,
    },
    create: {
      name: 'Admin IT',
      fullName: 'Admin IT',
      email: 'admin_it@spk.gov.my',
      password: hashedPassword,
      passwordHash: hashedPassword,
      role: 'PENTADBIR_SISTEM_IT',
      roleId: role.id,
      status: 'ACTIVE',
      isActive: true,
      createdBy: 'SYSTEM',
    }
  })

  console.log(`\n========================================`)
  console.log(`PENTADBIR_SISTEM_IT role and user created!`)
  console.log(`========================================`)
  console.log(`Role: ${role.roleName} (Code: ${role.roleCode}, ID: ${role.id})`)
  console.log(`User: ${user.email} | ${user.name} | Role: ${user.role} | Role ID: ${user.roleId}`)
  console.log(`========================================`)

  await prisma['$disconnect']()
}

main().catch((e) => { console.error('Error:', e); process.exit(1) })
