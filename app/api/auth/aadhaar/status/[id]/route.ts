import { NextRequest, NextResponse } from 'next/server';
import { getAadhaarProvider } from '@/lib/auth/aadhaar/provider';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'MISSING_ID', message: 'Verification ID is required.' },
        { status: 400 }
      );
    }

    const provider = getAadhaarProvider();
    const session = await provider.getVerificationStatus(id);

    if (!session) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Verification session not found or expired.' },
        { status: 404 }
      );
    }

    // Return sanitized status information only (never expose OTP or secrets)
    return NextResponse.json({
      verificationId: session.verificationId,
      status: session.status,
      provider: session.provider,
      isDemo: session.isDemo,
      expiresAt: session.expiresAt,
      maskedPhone: session.maskedPhone,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'STATUS_CHECK_FAILED', message: error?.message || 'Failed to check status.' },
      { status: 500 }
    );
  }
}
