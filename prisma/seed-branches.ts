import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedBranches() {
  console.log('🌱 Seeding branches...')

  try {
    // Create branches for Sky Nest Hotel
    const branches = [
      {
        name: 'Sky Nest Colombo',
        slug: 'colombo',
        location: 'Colombo',
        address: '123 Galle Road, Colombo 03',
        phone: '+94 11 234 5678',
        email: 'colombo@skynest.lk',
        totalRooms: 50,
        status: 'operational',
      },
      {
        name: 'Sky Nest Kandy',
        slug: 'kandy',
        location: 'Kandy',
        address: '456 Peradeniya Road, Kandy',
        phone: '+94 81 234 5678',
        email: 'kandy@skynest.lk',
        totalRooms: 35,
        status: 'operational',
      },
      {
        name: 'Sky Nest Galle',
        slug: 'galle',
        location: 'Galle',
        address: '789 Beach Road, Galle Fort',
        phone: '+94 91 234 5678',
        email: 'galle@skynest.lk',
        totalRooms: 40,
        status: 'operational',
      },
    ]

    for (const branch of branches) {
      const created = await prisma.branch.upsert({
        where: { slug: branch.slug },
        update: {},
        create: branch,
      })
      console.log(`✅ Created branch: ${created.name}`)
    }

    console.log('🎉 Branches seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding branches:', error)
    throw error
  }
}

seedBranches()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })