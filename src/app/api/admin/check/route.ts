import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    const isAuthenticated = adminSession?.value === 'authenticated'

    return NextResponse.json({ authenticated: isAuthenticated })
  } catch (error) {
    console.error('Error checking auth:', error)
    return NextResponse.json({ authenticated: false })
  }
}
