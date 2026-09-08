export type VerificationStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface CreateSessionOptions {
  role?: 'collector' | 'recycler' | 'citizen' | 'admin';
  consentGiven: boolean;
  ipAddress?: string;
  userAgent?: string;
  callbackUrl?: string;
}

export interface VerificationSession {
  verificationId: string;
  status: VerificationStatus;
  provider: string;
  isDemo: boolean;
  expiresAt: string;
  maskedPhone?: string;
  otpLength?: number;
  message?: string;
  sessionToken: string;
}

export interface VerifyOtpOptions {
  verificationId: string;
  sessionToken: string;
  otp: string;
  role?: 'collector' | 'recycler' | 'citizen' | 'admin';
}

export interface NormalizedVerificationResult {
  verificationId: string;
  status: VerificationStatus;
  isVerified: boolean;
  provider: string;
  isDemo: boolean;
  verifiedAt?: string;
  maskedAadhaar?: string;
  verifiedName?: string;
  gender?: 'M' | 'F' | 'O';
  state?: string;
  role: 'collector' | 'recycler' | 'citizen' | 'admin';
  destinationUrl: string;
  failureReason?: string;
}

export interface AadhaarProviderInterface {
  createVerificationSession(options: CreateSessionOptions): Promise<VerificationSession>;
  getVerificationStatus(verificationId: string): Promise<VerificationSession | null>;
  verifyOtp(options: VerifyOtpOptions): Promise<NormalizedVerificationResult>;
  handleCallback(payload: Record<string, unknown>): Promise<NormalizedVerificationResult>;
}
