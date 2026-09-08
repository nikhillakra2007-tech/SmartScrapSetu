import { NextRequest, NextResponse } from 'next/server';
import { getAadhaarProvider } from '@/lib/auth/aadhaar/provider';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const provider = getAadhaarProvider();

    const result = await provider.handleCallback(payload);

    if (!result.isVerified) {
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          failureReason: result.failureReason || 'Callback validation failed.',
        },
        { status: 400 }
      );
    }

    const userPayload = {
      id: `user_aadhaar_${result.verificationId}`,
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
      redirect: result.destinationUrl,
    });

    response.cookies.set({
      name: 'scrapsetu_auth_session',
      value: JSON.stringify(userPayload),
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'CALLBACK_FAILED',
        message: error?.message || 'Failed to process provider callback.',
      },
      { status: 500 }
    );
  }
}
