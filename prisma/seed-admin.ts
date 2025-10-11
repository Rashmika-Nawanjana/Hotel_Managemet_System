import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function seedAdmin() {
  console.log('🔐 Creating admin user...')

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@skynest.lk' },
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await hashPassword('Admin@123') // Change this password!

    // Get first branch
    const branch = await prisma.branch.findFirst()

    if (!branch) {
      console.log('❌ No branches found. Please create branches first.')
      return
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@skynest.lk',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true, // Auto-verify admin
        firstName: 'Admin',
        lastName: 'User',
        phone: '+94 11 234 5678',
        dateOfBirth: new Date('1990-01-01'),
        nationality: 'Sri Lankan',
        idType: 'NATIONAL_ID',
        idNumber: 'ADM123456789',
        address: '123 Admin Street',
        city: 'Colombo',
        postalCode: '00100',
        staffProfile: {
          create: {
            employeeId: 'EMP001',
            branchId: branch.id,
            department: 'Management',
            position: 'System Administrator',
            salary: 150000.00,
            hireDate: new Date(),
          },
        },
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@skynest.lk')
    console.log('🔑 Password: Admin@123')
    console.log('⚠️  IMPORTANT: Change this password after first login!')

    // Create a staff user too
    const staff = await prisma.user.create({
      data: {
        email: 'staff@skynest.lk',
        password: hashedPassword,
        role: 'STAFF',
        status: 'ACTIVE',
        emailVerified: true,
        firstName: 'Staff',
        lastName: 'Member',
        phone: '+94 11 234 5679',
        dateOfBirth: new Date('1995-01-01'),
        nationality: 'Sri Lankan',
        idType: 'NATIONAL_ID',
        idNumber: 'STF123456789',
        address: '456 Staff Street',
        city: 'Colombo',
        postalCode: '00100',
        staffProfile: {
          create: {
            employeeId: 'EMP002',
            branchId: branch.id,
            department: 'Front Desk',
            position: 'Receptionist',
            salary: 50000.00,
            hireDate: new Date(),
          },
        },
      },
    })

    console.log('✅ Staff user created successfully!')
    console.log('📧 Email: staff@skynest.lk')
    console.log('🔑 Password: Admin@123')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

seedAdmin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })