import { execute } from '@/lib/db-queries';
import bcrypt from 'bcryptjs';

function isAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;
  return user && user.role === 'ADMIN';
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  // Required: firstName, lastName, email, password, role, status, dateOfBirth, nationality
  if (!data.firstName || !data.lastName || !data.email || !data.password || !data.role || !data.status || !data.dateOfBirth || !data.nationality) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);
  await execute(
    'INSERT INTO users (id, email, password, role, status, "firstName", "lastName", phone, "dateOfBirth", nationality, "idType", "idNumber", address, city, "postalCode", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())',
    [
      data.email,
      hashedPassword,
      data.role,
      data.status,
      data.firstName,
      data.lastName,
      data.phone || '',
      data.dateOfBirth,
      data.nationality,
      data.idType || 'NATIONAL_ID',
      data.idNumber || '',
      data.address || '',
      data.city || '',
      data.postalCode || ''
    ]
  );
  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-queries';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Auth: Only allow admins
  const token = request.cookies.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all users with their profile info
  const users = await query(`
    SELECT 
      u.id, u.email, u.role, u.status, u."firstName", u."lastName", u.phone, u."createdAt", u."lastLoginAt",
      gp.id AS guestProfileId, gp."loyaltyPoints", gp."memberSince", gp."totalBookings", gp."totalSpent",
      sp.id AS staffProfileId, sp."employeeId", sp."branchId", sp.department, sp.position, sp.salary, sp."hireDate"
    FROM users u
    LEFT JOIN "GuestProfile" gp ON gp."userId " = u.id
    LEFT JOIN "StaffProfile" sp ON sp."userId" = u.id
    ORDER BY u."createdAt" DESC
  `);

  return NextResponse.json({ users });
}
