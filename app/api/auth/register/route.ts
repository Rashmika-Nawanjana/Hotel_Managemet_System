import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, generateVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { IdType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      idType,
      idNumber,
      address,
      city,
      postalCode,
      password,
      subscribeNewsletter = true,
    } = body

    // Validation
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || 
        !nationality || !idType || !idNumber || !address || !city || 
        !postalCode || !password) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    console.log('Checking existing user for email:', email.toLowerCase())
    console.log('Existing user found:', existingUser ? 'Yes' : 'No')

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please sign in or use a different email.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)
    console.log('Password hashed successfully')

    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Convert idType to enum
    const idTypeEnum = idType.toUpperCase() as IdType

    // Create user and guest profile in a transaction
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'GUEST',
        status: 'ACTIVE',
        emailVerified: false,
        firstName,
        lastName,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        nationality,
        idType: idTypeEnum,
        idNumber,
        address,
        city,
        postalCode,
        guestProfile: {
          create: {
            newsletter: subscribeNewsletter,
            emailNotifications: true,
            smsNotifications: true,
          },
        },
      },
      include: {
        guestProfile: true,
      },
    })

    console.log('User created successfully:', user.email)

    // Store verification token in database
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, firstName, verificationToken)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail registration if email fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}