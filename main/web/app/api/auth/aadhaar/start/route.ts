import { NextRequest, NextResponse } from 'next/server';
import { getAadhaarProvider } from '@/lib/auth/aadhaar/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { consentGiven, role, callbackUrl } = body;

    if (!consentGiven) {
      return NextResponse.json(
        {
          error: 'CONSENT_REQUIRED',
          message: 'User consent is mandatory before starting Aadhaar verification.',
        },
        { status: 400 }
      );
    }

    const provider = getAadhaarProvider();
    const session = await provider.createVerificationSession({
      consentGiven: true,
      role: role || 'collector',
      callbackUrl,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'SESSION_CREATION_FAILED',
        message: error?.message || 'Unable to create verification session.',
      },
      { status: 500 }
    );
  }
}
