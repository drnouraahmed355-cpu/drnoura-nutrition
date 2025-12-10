import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for session cookie from better-auth
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionCookie?.value;

  // Define route access rules
  const adminRoutes = ['/dashboard/staff', '/dashboard/cms'];
  const staffRoutes = ['/dashboard', '/dashboard/patients', '/dashboard/appointments', '/dashboard/messages'];
  const patientRoutes = ['/patient-ehr'];

  // Check if route requires authentication
  const requiresAuth = [...adminRoutes, ...staffRoutes, ...patientRoutes].some(route => 
    pathname.startsWith(route)
  );

  // Redirect to login if not authenticated
  if (requiresAuth && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patient-ehr/:path*',
  ],
};