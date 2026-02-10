import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function seedDatabase(dbPath: string) {
  console.log(`\nSeeding database: ${dbPath}`)
  const adapter = new PrismaLibSql({ url: dbPath })
  const prisma = new PrismaClient({ adapter })

  // Create PEMOHON role in roles table
  const pemohonRole = await prisma.role.upsert({
    where: { roleCode: 'PEMOHON' },
    update: {},
    create: {
      roleCode: 'PEMOHON',
      roleName: 'Pemohon',
      createdBy: 'SYSTEM',
    }
  })
  console.log(`Role created/found: ${pemohonRole.roleName} (ID: ${pemohonRole.id})`)

  // Update ahmad.abdullah@example.my - set role to PEMOHON and link to PEMOHON role
  const ahmadUser = await prisma.user.update({
    where: { email: 'ahmad.abdullah@example.my' },
    data: {
      role: 'PEMOHON',
      roleId: pemohonRole.id,
    }
  })

  await prisma['$disconnect']()
  return { pemohonRole, ahmadUser }
}

async function main() {
  console.log('Creating PEMOHON role and updating user...')

  const { pemohonRole, ahmadUser } = await seedDatabase('file:./prisma/dev.db')

  console.log(`\n========================================`)
  console.log(`PEMOHON role and user updated successfully!`)
  console.log(`========================================`)
  console.log(`Role: ${pemohonRole.roleName} (Code: ${pemohonRole.roleCode}, ID: ${pemohonRole.id})`)
  console.log(`----------------------------------------`)
  console.log(`User:`)
  console.log(`  Name:     ${ahmadUser.name}`)
  console.log(`  Email:    ${ahmadUser.email}`)
  console.log(`  Role:     ${ahmadUser.role}`)
  console.log(`  Role ID:  ${ahmadUser.roleId}`)
  console.log(`  Status:   ${ahmadUser.status}`)
  console.log(`========================================`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
