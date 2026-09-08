'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { T, useLocale } from '@/components/language/Language';
import { VerificationSession, NormalizedVerificationResult } from '@/lib/auth/aadhaar/types';
import styles from './AuthPage.module.css';

interface AadhaarVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'collector' | 'recycler' | 'citizen' | 'admin';
  onSuccess: (destinationUrl: string, user: any) => void;
}

export default function AadhaarVerificationModal({
  isOpen,
  onClose,
  role,
  onSuccess,
}: AadhaarVerificationModalProps) {
  const { t } = useLocale();

  const [session, setSession] = useState<VerificationSession | null>(null);
  const [otp, setOtp] = useState<string>('123456');
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Initiate verification session on open
  useEffect(() => {
    if (!isOpen) {
      setSession(null);
      setErrorMessage(null);
      setIsSuccess(false);
      return;
    }

    let isMounted = true;

    async function initiateSession() {
      setIsStarting(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/auth/aadhaar/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consentGiven: true, role }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Unable to create verification session');
        }

        if (isMounted) {
          setSession(data.session);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Error communicating with verification provider.');
        }
      } finally {
        if (isMounted) {
          setIsStarting(false);
        }
      }
    }

    initiateSession();

    return () => {
      isMounted = false;
    };
  }, [isOpen, role]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || isVerifying || isSuccess) return;

    if (!otp || otp.trim().length < 6) {
      setErrorMessage('Please enter the 6-digit verification OTP.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/aadhaar/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: session.verificationId,
          sessionToken: session.sessionToken,
          otp: otp.trim(),
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.failureReason || 'OTP verification failed.');
        setIsVerifying(false);
        return;
      }

      setIsSuccess(true);
      setIsVerifying(false);

      // Save local session state
      if (typeof window !== 'undefined') {
        localStorage.setItem('scrapsetu_auth_user', JSON.stringify(data.user));
      }

      // Short delay for success animation
      setTimeout(() => {
        onSuccess(data.result.destinationUrl, data.user);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection failed during OTP verification.');
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-modal-title"
      onClick={() => {
        if (!isVerifying && !isSuccess) onClose();
      }}
    >
      <div
        className={styles.verificationCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.verifyModalHeader}>
          <div className={styles.aadhaarBadgeWrap}>
            <ShieldCheck size={24} className={styles.shieldIcon} />
          </div>
          <div>
            <h2 id="verify-modal-title" className={styles.verifyTitle}>
              <T>auth.verification.modalTitle</T>
            </h2>
            <div className={styles.demoWarningBadge}>
              <Sparkles size={13} />
              <span>
                <strong>DEMO MODE</strong> — This is not real UIDAI verification.
              </span>
            </div>
          </div>
          {!isVerifying && !isSuccess && (
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className={styles.verifyModalBody}>
          {isStarting && (
            <div className={styles.loadingState}>
              <RefreshCw size={28} className={styles.spin} />
              <p><T>Initializing secure identity gateway…</T></p>
            </div>
          )}

          {isSuccess && (
            <div className={styles.successState}>
              <CheckCircle2 size={54} className={styles.successIcon} />
              <h3><T>auth.verification.successTitle</T></h3>
              <p><T>auth.verification.successMessage</T></p>
              <span className={styles.redirectHint}><T>Redirecting to your workspace…</T></span>
            </div>
          )}

          {!isStarting && !isSuccess && session && (
            <form onSubmit={handleVerify} className={styles.verifyForm}>
              <div className={styles.phoneNoticeBox}>
                <Smartphone size={18} className={styles.phoneIcon} />
                <div>
                  <span className={styles.phoneNoticeText}>
                    <T>auth.verification.otpSentNotice</T> <strong>{session.maskedPhone || 'XXXXXX8942'}</strong>
                  </span>
                  <span className={styles.demoHelperText}>
                    (For demo evaluation, test OTP is preset to <code>123456</code>)
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div role="alert" className={styles.errorBanner}>
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className={styles.otpInputGroup}>
                <label htmlFor="aadhaar-otp" className={styles.otpLabel}>
                  <KeyRound size={15} />
                  <T>auth.verification.enterOtpPrompt</T>
                </label>
                <input
                  id="aadhaar-otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  placeholder={t('auth.verification.otpPlaceholder')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={styles.otpInputField}
                  disabled={isVerifying}
                />
              </div>

              <div className={styles.simulationPills}>
                <span className={styles.simLabel}>Quick test cases:</span>
                <button
                  type="button"
                  className={styles.simPill}
                  onClick={() => setOtp('123456')}
                  title="Test successful verification"
                >
                  ✓ Valid OTP (123456)
                </button>
                <button
                  type="button"
                  className={styles.simPill}
                  onClick={() => setOtp('000000')}
                  title="Test invalid OTP error"
                >
                  ✗ Invalid OTP (000000)
                </button>
              </div>

              <div className={styles.verifyActionRow}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onClose}
                  disabled={isVerifying}
                >
                  <T>common.cancel</T>
                </button>
                <button
                  type="submit"
                  className={styles.submitVerifyBtn}
                  disabled={isVerifying || otp.length < 6}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={16} className={styles.spin} />
                      <T>auth.verification.verifying</T>
                    </>
                  ) : (
                    <T>auth.verification.verifyButton</T>
                  )}
                </button>
              </div>
            </form>
          )}

          {!isStarting && !session && errorMessage && (
            <div className={styles.errorState}>
              <AlertCircle size={36} className={styles.errorIcon} />
              <p>{errorMessage}</p>
              <button
                type="button"
                className={styles.agreeBtn}
                onClick={() => {
                  setErrorMessage(null);
                  onClose();
                }}
              >
                <T>common.close</T>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
