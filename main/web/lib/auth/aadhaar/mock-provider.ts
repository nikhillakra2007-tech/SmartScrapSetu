import {
  AadhaarProviderInterface,
  CreateSessionOptions,
  VerificationSession,
  VerifyOtpOptions,
  NormalizedVerificationResult,
} from './types';

// In-memory demo session cache (Node.js runtime server-side)
const mockSessions = new Map<
  string,
  {
    session: VerificationSession;
    createdAt: number;
    expectedOtp: string;
    role: 'collector' | 'recycler' | 'citizen' | 'admin';
  }
>();

export class MockAadhaarVerificationProvider implements AadhaarProviderInterface {
  readonly providerName = 'mock';

  async createVerificationSession(options: CreateSessionOptions): Promise<VerificationSession> {
    if (!options.consentGiven) {
      throw new Error('CONSENT_REQUIRED: User consent is strictly required to initiate verification.');
    }

    const verificationId = `aadhaar_demo_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const sessionToken = `stk_${Math.random().toString(36).substring(2, 16)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    const session: VerificationSession = {
      verificationId,
      status: 'PENDING',
      provider: 'mock',
      isDemo: true,
      expiresAt,
      maskedPhone: 'XXXXXX8942',
      otpLength: 6,
      message: 'DEMO MODE: Enter test OTP 123456 to verify (000000 to test failure).',
      sessionToken,
    };

    mockSessions.set(verificationId, {
      session,
      createdAt: Date.now(),
      expectedOtp: '123456',
      role: options.role || 'collector',
    });

    return session;
  }

  async getVerificationStatus(verificationId: string): Promise<VerificationSession | null> {
    const record = mockSessions.get(verificationId);
    if (!record) return null;

    // Check expiry
    if (Date.now() - record.createdAt > 10 * 60 * 1000) {
      record.session.status = 'EXPIRED';
    }

    return record.session;
  }

  async verifyOtp(options: VerifyOtpOptions): Promise<NormalizedVerificationResult> {
    const record = mockSessions.get(options.verificationId);

    if (!record) {
      return {
        verificationId: options.verificationId,
        status: 'FAILED',
        isVerified: false,
        provider: 'mock',
        isDemo: true,
        role: options.role || 'collector',
        destinationUrl: '/auth',
        failureReason: 'Verification session expired or invalid. Please start over.',
      };
    }

    // Validate session token
    if (record.session.sessionToken !== options.sessionToken) {
      return {
        verificationId: options.verificationId,
        status: 'FAILED',
        isVerified: false,
        provider: 'mock',
        isDemo: true,
        role: record.role,
        destinationUrl: '/auth',
        failureReason: 'Invalid session token (possible replay attack).',
      };
    }

    // Check expiry
    if (Date.now() - record.createdAt > 10 * 60 * 1000) {
      record.session.status = 'EXPIRED';
      return {
        verificationId: options.verificationId,
        status: 'EXPIRED',
        isVerified: false,
        provider: 'mock',
        isDemo: true,
        role: record.role,
        destinationUrl: '/auth',
        failureReason: 'Verification session expired after 10 minutes.',
      };
    }

    const trimmedOtp = options.otp.trim();

    if (trimmedOtp === '000000') {
      record.session.status = 'FAILED';
      return {
        verificationId: options.verificationId,
        status: 'FAILED',
        isVerified: false,
        provider: 'mock',
        isDemo: true,
        role: record.role,
        destinationUrl: '/auth',
        failureReason: 'Invalid verification OTP entered.',
      };
    }

    if (trimmedOtp === '999999') {
      record.session.status = 'CANCELLED';
      return {
        verificationId: options.verificationId,
        status: 'CANCELLED',
        isVerified: false,
        provider: 'mock',
        isDemo: true,
        role: record.role,
        destinationUrl: '/auth',
        failureReason: 'Verification was cancelled by the user.',
      };
    }

    if (trimmedOtp !== record.expectedOtp) {
      return {
        verificationId: options.verificationId,
        status: 'PENDING',
        isVerified: false,
        provider: 'mock',
        isDemo: true,
        role: record.role,
        destinationUrl: '/auth',
        failureReason: 'Incorrect OTP. For Demo Mode, use OTP: 123456',
      };
    }

    // Successful mock verification
    record.session.status = 'VERIFIED';

    const role = options.role || record.role || 'collector';
    const destinationUrl =
      role === 'citizen'
        ? '/citizen'
        : role === 'collector'
        ? '/collector'
        : role === 'admin'
        ? '/admin'
        : '/recycler';

    return {
      verificationId: options.verificationId,
      status: 'VERIFIED',
      isVerified: true,
      provider: 'mock',
      isDemo: true,
      verifiedAt: new Date().toISOString(),
      maskedAadhaar: 'XXXXXXXX4829',
      verifiedName: role === 'collector' ? 'Ramesh Kumar' : role === 'citizen' ? 'Aarav Sharma' : 'Vinayak Sharma',
      gender: 'M',
      state: 'Delhi (DL)',
      role,
      destinationUrl,
    };
  }

  async handleCallback(payload: Record<string, unknown>): Promise<NormalizedVerificationResult> {
    const verificationId = String(payload.verificationId || '');
    return this.verifyOtp({
      verificationId,
      sessionToken: String(payload.sessionToken || ''),
      otp: String(payload.otp || '123456'),
    });
  }
}
