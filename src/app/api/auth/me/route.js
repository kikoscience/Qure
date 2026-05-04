import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('auth_user');
    
    if (!userCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
