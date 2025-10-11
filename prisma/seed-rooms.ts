import { PrismaClient, AmenityCategory, RoomStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRooms() {
  console.log('🌱 Seeding room management data...')

  try {
    // Get existing branches (assuming you have at least one)
    const branches = await prisma.branch.findMany()
    
    if (branches.length === 0) {
      console.log('❌ No branches found. Please create branches first.')
      return
    }

    const branch = branches[0] // Use first branch for demo

    console.log(`📍 Using branch: ${branch.name}`)

    // 1. Create Amenities
    console.log('Creating amenities...')
    
    const amenitiesData = [
      // Entertainment
      { name: 'Smart TV', icon: '📺', category: 'ENTERTAINMENT' as AmenityCategory, description: '55-inch 4K Smart TV with streaming services' },
      { name: 'Premium Cable', icon: '📡', category: 'ENTERTAINMENT' as AmenityCategory, description: 'Over 100 international channels' },
      { name: 'Bluetooth Speaker', icon: '🔊', category: 'ENTERTAINMENT' as AmenityCategory, description: 'High-quality wireless speaker' },
      
      // Technology
      { name: 'High-Speed WiFi', icon: '📶', category: 'TECHNOLOGY' as AmenityCategory, description: 'Complimentary fiber-optic internet' },
      { name: 'USB Charging Ports', icon: '🔌', category: 'TECHNOLOGY' as AmenityCategory, description: 'Multiple USB ports near bed' },
      { name: 'Laptop Safe', icon: '💻', category: 'TECHNOLOGY' as AmenityCategory, description: 'Secure safe for electronics' },
      { name: 'Work Desk', icon: '🪑', category: 'TECHNOLOGY' as AmenityCategory, description: 'Ergonomic desk with good lighting' },
      
      // Comfort
      { name: 'Air Conditioning', icon: '❄️', category: 'COMFORT' as AmenityCategory, description: 'Individual climate control' },
      { name: 'Premium Bedding', icon: '🛏️', category: 'COMFORT' as AmenityCategory, description: 'Egyptian cotton sheets' },
      { name: 'Blackout Curtains', icon: '🌙', category: 'COMFORT' as AmenityCategory, description: 'Complete light blocking' },
      { name: 'Seating Area', icon: '🛋️', category: 'COMFORT' as AmenityCategory, description: 'Comfortable lounge seating' },
      { name: 'Balcony', icon: '🌴', category: 'COMFORT' as AmenityCategory, description: 'Private outdoor space' },
      
      // Bathroom
      { name: 'Rainfall Shower', icon: '🚿', category: 'BATHROOM' as AmenityCategory, description: 'Luxury rain showerhead' },
      { name: 'Bathtub', icon: '🛁', category: 'BATHROOM' as AmenityCategory, description: 'Deep soaking tub' },
      { name: 'Premium Toiletries', icon: '🧴', category: 'BATHROOM' as AmenityCategory, description: 'Luxury bath products' },
      { name: 'Hair Dryer', icon: '💨', category: 'BATHROOM' as AmenityCategory, description: 'Professional grade dryer' },
      { name: 'Bathrobes & Slippers', icon: '👘', category: 'BATHROOM' as AmenityCategory, description: 'Plush robes and slippers' },
      
      // Food & Beverage
      { name: 'Mini Bar', icon: '🍷', category: 'FOOD_BEVERAGE' as AmenityCategory, description: 'Stocked mini refrigerator' },
      { name: 'Coffee Machine', icon: '☕', category: 'FOOD_BEVERAGE' as AmenityCategory, description: 'Nespresso coffee maker' },
      { name: 'Mini Fridge', icon: '🧊', category: 'FOOD_BEVERAGE' as AmenityCategory, description: 'Personal refrigerator' },
      { name: 'Electric Kettle', icon: '🫖', category: 'FOOD_BEVERAGE' as AmenityCategory, description: 'With tea selection' },
      
      // Safety
      { name: 'In-Room Safe', icon: '🔐', category: 'SAFETY' as AmenityCategory, description: 'Electronic safe' },
      { name: 'Smoke Detector', icon: '🚨', category: 'SAFETY' as AmenityCategory, description: 'Fire safety system' },
      { name: 'First Aid Kit', icon: '🩹', category: 'SAFETY' as AmenityCategory, description: 'Basic medical supplies' },
      
      // Accessibility
      { name: 'Wheelchair Accessible', icon: '♿', category: 'ACCESSIBILITY' as AmenityCategory, description: 'ADA compliant' },
      { name: 'Grab Bars', icon: '🚽', category: 'ACCESSIBILITY' as AmenityCategory, description: 'Bathroom safety bars' },
    ]

    const amenities = await Promise.all(
      amenitiesData.map(async (amenity) => {
        return prisma.amenity.upsert({
          where: { name: amenity.name },
          update: {},
          create: amenity,
        })
      })
    )

    console.log(`✅ Created ${amenities.length} amenities`)

    // 2. Create Room Types
    console.log('Creating room types...')

    // Standard Room
    const standardRoom = await prisma.roomType.create({
      data: {
        name: 'Standard Room',
        slug: 'standard-room',
        description: 'Our comfortable Standard Rooms offer everything you need for a pleasant stay. Perfect for solo travelers or couples, these cozy rooms provide modern amenities and a relaxing atmosphere.',
        shortDescription: 'Comfortable room with essential amenities',
        basePrice: 8500.00,
        maxOccupancy: 2,
        bedType: 'Queen',
        numberOfBeds: 1,
        roomSize: 25,
        viewType: 'Garden View',
        branchId: branch.id,
        status: 'active',
        isFeatured: false,
        popularityScore: 85,
      },
    })

    // Deluxe Room
    const deluxeRoom = await prisma.roomType.create({
      data: {
        name: 'Deluxe Room',
        slug: 'deluxe-room',
        description: 'Experience enhanced comfort in our Deluxe Rooms. Featuring premium bedding, a work desk, and a seating area, these spacious rooms are ideal for both business and leisure travelers.',
        shortDescription: 'Spacious room with premium amenities',
        basePrice: 12500.00,
        maxOccupancy: 3,
        bedType: 'King',
        numberOfBeds: 1,
        roomSize: 35,
        viewType: 'City View',
        branchId: branch.id,
        status: 'active',
        isFeatured: true,
        popularityScore: 92,
      },
    })

    // Executive Suite
    const executiveSuite = await prisma.roomType.create({
      data: {
        name: 'Executive Suite',
        slug: 'executive-suite',
        description: 'Indulge in luxury with our Executive Suites. These elegant suites feature a separate living area, premium amenities, and stunning ocean views. Perfect for special occasions or extended stays.',
        shortDescription: 'Luxury suite with separate living area',
        basePrice: 18500.00,
        maxOccupancy: 4,
        bedType: 'King',
        numberOfBeds: 1,
        roomSize: 50,
        viewType: 'Ocean View',
        branchId: branch.id,
        status: 'active',
        isFeatured: true,
        popularityScore: 96,
      },
    })

    // Family Suite
    const familySuite = await prisma.roomType.create({
      data: {
        name: 'Family Suite',
        slug: 'family-suite',
        description: 'Our spacious Family Suites are designed with families in mind. Featuring two bedrooms, a living area, and kid-friendly amenities, these suites ensure everyone has a comfortable stay.',
        shortDescription: 'Spacious suite perfect for families',
        basePrice: 22000.00,
        maxOccupancy: 6,
        bedType: 'King & Twin',
        numberOfBeds: 3,
        roomSize: 65,
        viewType: 'Pool View',
        branchId: branch.id,
        status: 'active',
        isFeatured: true,
        popularityScore: 89,
      },
    })

    // Presidential Suite
    const presidentialSuite = await prisma.roomType.create({
      data: {
        name: 'Presidential Suite',
        slug: 'presidential-suite',
        description: 'The pinnacle of luxury hospitality. Our Presidential Suite offers unparalleled elegance with panoramic ocean views, private balcony, butler service, and the finest amenities. An unforgettable experience awaits.',
        shortDescription: 'Ultimate luxury with exclusive services',
        basePrice: 45000.00,
        maxOccupancy: 4,
        bedType: 'California King',
        numberOfBeds: 1,
        roomSize: 120,
        viewType: 'Panoramic Ocean View',
        branchId: branch.id,
        status: 'active',
        isFeatured: true,
        popularityScore: 100,
      },
    })

    console.log('✅ Created 5 room types')

    // 3. Assign Amenities to Room Types
    console.log('Assigning amenities to room types...')

    // Helper to find amenities by name
    const getAmenity = (name: string) => amenities.find(a => a.name === name)!

    // Standard Room Amenities (Basic)
    await prisma.roomTypeAmenity.createMany({
      data: [
        { roomTypeId: standardRoom.id, amenityId: getAmenity('High-Speed WiFi').id },
        { roomTypeId: standardRoom.id, amenityId: getAmenity('Smart TV').id },
        { roomTypeId: standardRoom.id, amenityId: getAmenity('Air Conditioning').id },
        { roomTypeId: standardRoom.id, amenityId: getAmenity('Premium Bedding').id },
        { roomTypeId: standardRoom.id, amenityId: getAmenity('Hair Dryer').id },
        { roomTypeId: standardRoom.id, amenityId: getAmenity('In-Room Safe').id },
        { roomTypeId: standardRoom.id, amenityId: getAmenity('Electric Kettle').id },
        { roomTypeId: standardRoom.id, amenityId: getAmenity('Smoke Detector').id },
      ],
    })

    // Deluxe Room Amenities (Enhanced)
    await prisma.roomTypeAmenity.createMany({
      data: [
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('High-Speed WiFi').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Smart TV').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Premium Cable').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Air Conditioning').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Premium Bedding').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Blackout Curtains').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Work Desk').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Seating Area').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Rainfall Shower').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Premium Toiletries').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Coffee Machine').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('Mini Fridge').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('In-Room Safe').id },
        { roomTypeId: deluxeRoom.id, amenityId: getAmenity('USB Charging Ports').id },
      ],
    })

    // Executive Suite Amenities (Premium)
    await prisma.roomTypeAmenity.createMany({
      data: [
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('High-Speed WiFi').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Smart TV').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Premium Cable').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Bluetooth Speaker').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Air Conditioning').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Premium Bedding').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Blackout Curtains').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Seating Area').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Balcony').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Work Desk').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Rainfall Shower').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Bathtub').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Premium Toiletries').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Bathrobes & Slippers').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Mini Bar').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Coffee Machine').id },
        { roomTypeId: executiveSuite.id, amenityId: getAmenity('Laptop Safe').id },
      ],
    })

    // Family Suite Amenities
    await prisma.roomTypeAmenity.createMany({
      data: [
        { roomTypeId: familySuite.id, amenityId: getAmenity('High-Speed WiFi').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Smart TV').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Premium Cable').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Air Conditioning').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Premium Bedding').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Seating Area').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Balcony').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Rainfall Shower').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Bathtub').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Mini Fridge').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('Coffee Machine').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('In-Room Safe').id },
        { roomTypeId: familySuite.id, amenityId: getAmenity('First Aid Kit').id },
      ],
    })

    // Presidential Suite Amenities (All Premium)
    await prisma.roomTypeAmenity.createMany({
      data: amenities
        .filter(a => ['ENTERTAINMENT', 'TECHNOLOGY', 'COMFORT', 'BATHROOM', 'FOOD_BEVERAGE', 'SAFETY'].includes(a.category))
        .map(a => ({
          roomTypeId: presidentialSuite.id,
          amenityId: a.id,
        })),
    })

    console.log('✅ Assigned amenities to room types')

    // 4. Create Room Images (using placeholder images)
    console.log('Creating room images...')

    const imageData = [
      // Standard Room
      { roomTypeId: standardRoom.id, url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', isPrimary: true, order: 1, caption: 'Cozy Standard Room', altText: 'Standard room with queen bed' },
      { roomTypeId: standardRoom.id, url: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', isPrimary: false, order: 2, caption: 'Modern Bathroom', altText: 'Clean bathroom with shower' },
      
      // Deluxe Room
      { roomTypeId: deluxeRoom.id, url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', isPrimary: true, order: 1, caption: 'Spacious Deluxe Room', altText: 'Deluxe room with king bed' },
      { roomTypeId: deluxeRoom.id, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', isPrimary: false, order: 2, caption: 'City View', altText: 'Room with city view' },
      { roomTypeId: deluxeRoom.id, url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', isPrimary: false, order: 3, caption: 'Work Area', altText: 'Desk and seating area' },
      
      // Executive Suite
      { roomTypeId: executiveSuite.id, url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800', isPrimary: true, order: 1, caption: 'Luxurious Executive Suite', altText: 'Executive suite bedroom' },
      { roomTypeId: executiveSuite.id, url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800', isPrimary: false, order: 2, caption: 'Living Area', altText: 'Suite living room' },
      { roomTypeId: executiveSuite.id, url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', isPrimary: false, order: 3, caption: 'Ocean View Balcony', altText: 'Balcony with ocean view' },
      
      // Family Suite
      { roomTypeId: familySuite.id, url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', isPrimary: true, order: 1, caption: 'Spacious Family Suite', altText: 'Family suite main bedroom' },
      { roomTypeId: familySuite.id, url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', isPrimary: false, order: 2, caption: 'Second Bedroom', altText: 'Kids bedroom with twin beds' },
      
      // Presidential Suite
      { roomTypeId: presidentialSuite.id, url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', isPrimary: true, order: 1, caption: 'Presidential Suite', altText: 'Luxurious presidential suite' },
      { roomTypeId: presidentialSuite.id, url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', isPrimary: false, order: 2, caption: 'Master Bathroom', altText: 'Luxury bathroom with tub' },
      { roomTypeId: presidentialSuite.id, url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', isPrimary: false, order: 3, caption: 'Panoramic View', altText: 'Ocean view from suite' },
    ]

    await prisma.roomImage.createMany({ data: imageData })

    console.log(`✅ Created ${imageData.length} room images`)

    // 5. Create Individual Room Instances
    console.log('Creating individual room instances...')

    const roomInstances = []

    // Standard Rooms (Floor 1-2, Rooms 101-120)
    for (let floor = 1; floor <= 2; floor++) {
      for (let room = 1; room <= 10; room++) {
        roomInstances.push({
          roomNumber: `${floor}${room.toString().padStart(2, '0')}`,
          floor,
          roomTypeId: standardRoom.id,
          branchId: branch.id,
          status: 'AVAILABLE' as RoomStatus,
        })
      }
    }

    // Deluxe Rooms (Floor 3-4, Rooms 301-320)
    for (let floor = 3; floor <= 4; floor++) {
      for (let room = 1; room <= 10; room++) {
        roomInstances.push({
          roomNumber: `${floor}${room.toString().padStart(2, '0')}`,
          floor,
          roomTypeId: deluxeRoom.id,
          branchId: branch.id,
          status: 'AVAILABLE' as RoomStatus,
        })
      }
    }

    // Executive Suites (Floor 5, Rooms 501-510)
    for (let room = 1; room <= 10; room++) {
      roomInstances.push({
        roomNumber: `5${room.toString().padStart(2, '0')}`,
        floor: 5,
        roomTypeId: executiveSuite.id,
        branchId: branch.id,
        status: 'AVAILABLE' as RoomStatus,
      })
    }

    // Family Suites (Floor 6, Rooms 601-605)
    for (let room = 1; room <= 5; room++) {
      roomInstances.push({
        roomNumber: `6${room.toString().padStart(2, '0')}`,
        floor: 6,
        roomTypeId: familySuite.id,
        branchId: branch.id,
        status: 'AVAILABLE' as RoomStatus,
      })
    }

    // Presidential Suite (Floor 7, Room 701)
    roomInstances.push({
      roomNumber: '701',
      floor: 7,
      roomTypeId: presidentialSuite.id,
      branchId: branch.id,
      status: 'AVAILABLE' as RoomStatus,
      notes: 'VIP Suite - Requires special approval',
    })

    await prisma.room.createMany({ data: roomInstances })

    console.log(`✅ Created ${roomInstances.length} room instances`)

    console.log('🎉 Room management data seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  }
}

seedRooms()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })