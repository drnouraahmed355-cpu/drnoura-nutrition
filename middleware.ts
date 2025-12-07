import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { pathname } = request.nextUrl;

  // Define route access rules
  const adminRoutes = ['/dashboard/staff', '/dashboard/cms'];
  const staffRoutes = ['/dashboard', '/dashboard/patients', '/dashboard/appointments', '/dashboard/messages'];
  const patientRoutes = ['/patient-ehr'];

  // Check if route requires authentication
  const requiresAuth = [...adminRoutes, ...staffRoutes, ...patientRoutes].some(route => 
    pathname.startsWith(route)
  );

  // Redirect to login if not authenticated
  if (requiresAuth && !session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (session?.user) {
    const userRole = session.user.role;

    // Admin-only routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Patient-only routes
    if (patientRoutes.some(route => pathname.startsWith(route))) {
      if (userRole !== 'patient') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Staff routes (admin, doctor, staff can access)
    if (staffRoutes.some(route => pathname.startsWith(route))) {
      if (userRole === 'patient') {
        return NextResponse.redirect(new URL('/patient-ehr', request.url));
      }
    }

    // Redirect patients trying to access staff dashboard
    if (pathname === '/dashboard' && userRole === 'patient') {
      return NextResponse.redirect(new URL('/patient-ehr', request.url));
    }

    // Redirect staff/admin trying to access patient EHR
    if (pathname === '/patient-ehr' && userRole !== 'patient') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patient-ehr/:path*',
  ],
};