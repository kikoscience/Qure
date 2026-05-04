import { NextResponse } from 'next/server';
import { getHospitalPool, sql } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const pool = await getHospitalPool();
    
    // Query the hospital database using their encryption function
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query(`
        SELECT top 1 
          user_name, 
          user_level, 
          employeeid,
          medilogs.f.get_empname(employeeid) AS actual_name
        FROM hospital.dbo.user_acc 
        WHERE user_name = @username 
        AND user_pass = medilogs.dbo.ufn_crypto(@password, 1)
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const user = result.recordset[0];

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 12, // 12 hours
      path: '/',
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
