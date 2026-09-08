import {
  AadhaarProviderInterface,
  CreateSessionOptions,
  VerificationSession,
  VerifyOtpOptions,
  NormalizedVerificationResult,
} from './types';

export class ProductionAadhaarVerificationProvider implements AadhaarProviderInterface {
  readonly providerName = 'production_gateway';
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor() {
    this.baseUrl = process.env.AADHAAR_API_BASE_URL || 'https://api.verifications.gov.in/v1';
    this.clientId = process.env.AADHAAR_CLIENT_ID || '';
    this.clientSecret = process.env.AADHAAR_CLIENT_SECRET || '';
    this.callbackUrl = process.env.AADHAAR_CALLBACK_URL || 'https://scrapsetu.in/api/auth/aadhaar/callback';
  }

  async createVerificationSession(options: CreateSessionOptions): Promise<VerificationSession> {
    if (!options.consentGiven) {
      throw new Error('CONSENT_REQUIRED: User consent must be granted before contacting authorized verification gateway.');
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PROVIDER_CONFIG_ERROR: Production Aadhaar provider credentials are not configured on the server.');
    }

    const response = await fetch(`${this.baseUrl}/session/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`,
      },
      body: JSON.stringify({
        purpose: 'Circular Economy Informal Waste Collector Compliance — Delhi DPCC',
        callback_url: options.callbackUrl || this.callbackUrl,
        consent_timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to initiate secure verification session with authorized gateway.');
    }

    const data = await response.json();
    return {
      verificationId: data.session_id,
      status: 'PENDING',
      provider: 'production_gateway',
      isDemo: false,
      expiresAt: data.expires_at,
      maskedPhone: data.masked_mobile,
      otpLength: 6,
      sessionToken: data.csrf_token,
    };
  }

  async getVerificationStatus(verificationId: string): Promise<VerificationSession | null> {
    const response = await fetch(`${this.baseUrl}/session/status/${verificationId}`, {
      headers: {
        'X-Client-Id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`,
      },
    });

    if (!response.ok) return null;
    const data = await response.json();

    return {
      verificationId,
      status: data.status,
      provider: 'production_gateway',
      isDemo: false,
      expiresAt: data.expires_at,
      sessionToken: data.csrf_token,
    };
  }

  async verifyOtp(options: VerifyOtpOptions): Promise<NormalizedVerificationResult> {
    const response = await fetch(`${this.baseUrl}/session/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`,
      },
      body: JSON.stringify({
        session_id: options.verificationId,
        csrf_token: options.sessionToken,
        otp: options.otp,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status !== 'VERIFIED') {
      return {
        verificationId: options.verificationId,
        status: 'FAILED',
        isVerified: false,
        provider: 'production_gateway',
        isDemo: false,
        role: options.role || 'collector',
        destinationUrl: '/auth',
        failureReason: data.error_message || 'Verification could not be completed with provider.',
      };
    }

    const role = options.role || 'collector';
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
      provider: 'production_gateway',
      isDemo: false,
      verifiedAt: new Date().toISOString(),
      maskedAadhaar: data.masked_uid,
      verifiedName: data.name,
      gender: data.gender,
      state: data.state,
      role,
      destinationUrl,
    };
  }

  async handleCallback(payload: Record<string, unknown>): Promise<NormalizedVerificationResult> {
    // Validate signature and payload
    const verificationId = String(payload.session_id || '');
    return this.verifyOtp({
      verificationId,
      sessionToken: String(payload.csrf_token || ''),
      otp: String(payload.otp || ''),
    });
  }
}
