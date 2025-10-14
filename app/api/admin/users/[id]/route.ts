import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db-queries';
import { verifyToken } from '@/lib/auth';

// Auth helper
function isAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;
  return user && user.role === 'ADMIN';
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = params.id;
  // Prevent self-delete (optional)
  // ...
  await execute('DELETE FROM users WHERE id = $1', [userId]);
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = params.id;
  const data = await request.json();
  // Only allow updating certain fields
  await execute(
    'UPDATE users SET "firstName" = $1, "lastName" = $2, email = $3, role = $4, status = $5 WHERE id = $6',
    [data.firstName, data.lastName, data.email, data.role, data.status, userId]
  );
  return NextResponse.json({ success: true });
}
