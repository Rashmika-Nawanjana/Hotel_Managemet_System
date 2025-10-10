import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      emailVerified: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  })

  console.log('\n=== Users in Database ===')
  console.log(`Total users: ${users.length}\n`)
  
  if (users.length === 0) {
    console.log('No users found in database!')
  } else {
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Verified: ${user.emailVerified}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
