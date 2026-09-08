import { NextRequest, NextResponse } from 'next/server';
import { getAadhaarProvider } from '@/lib/auth/aadhaar/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { verificationId, sessionToken, otp, role } = body;

    if (!verificationId || !sessionToken || !otp) {
      return NextResponse.json(
        {
          error: 'MISSING_FIELDS',
          message: 'Verification ID, session token, and OTP are required.',
        },
        { status: 400 }
      );
    }

    const provider = getAadhaarProvider();
    const result = await provider.verifyOtp({
      verificationId,
      sessionToken,
      otp,
      role: role || 'collector',
    });

    if (!result.isVerified) {
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          failureReason: result.failureReason || 'OTP verification failed.',
        },
        { status: 400 }
      );
    }

    // Prepare authenticated session user payload
    const userPayload = {
      id: `user_aadhaar_${verificationId}`,
      name: result.verifiedName || 'Aadhaar Verified User',
      email: `${result.role || 'collector'}.aadhaar@scrapsetu.in`,
      role: result.role,
      isAadhaarVerified: true,
      maskedAadhaar: result.maskedAadhaar,
      verifiedAt: result.verifiedAt,
    };

    const response = NextResponse.json({
      success: true,
      result,
      user: userPayload,
    });

    // Set auth cookie
    response.cookies.set({
      name: 'scrapsetu_auth_session',
      value: JSON.stringify(userPayload),
      httpOnly: false, // accessible to client for offline demo sync
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'VERIFICATION_ERROR',
        message: error?.message || 'Server error during OTP verification.',
      },
      { status: 500 }
    );
  }
}
