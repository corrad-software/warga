import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function main() {
  const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })
  const prisma = new PrismaClient({ adapter })

  const pegawaiKonsul = await prisma.role.upsert({
    where: { roleCode: 'PEGAWAI_KONSUL' },
    update: {},
    create: {
      roleCode: 'PEGAWAI_KONSUL',
      roleName: 'Pegawai Konsul',
      createdBy: 'SYSTEM',
    }
  })
  console.log(`Role created/found: ${pegawaiKonsul.roleName} (ID: ${pegawaiKonsul.id})`)

  const pegawaiPendaftaran = await prisma.role.upsert({
    where: { roleCode: 'PEGAWAI_PENDAFTARAN' },
    update: {},
    create: {
      roleCode: 'PEGAWAI_PENDAFTARAN',
      roleName: 'Pegawai Pendaftaran',
      createdBy: 'SYSTEM',
    }
  })
  console.log(`Role created/found: ${pegawaiPendaftaran.roleName} (ID: ${pegawaiPendaftaran.id})`)

  await prisma['$disconnect']()
  console.log('\nDone! Both roles created successfully.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
