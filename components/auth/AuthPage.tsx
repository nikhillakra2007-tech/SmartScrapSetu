'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { T, useLocale, LanguageSwitcher } from '@/components/language/Language';
import AadhaarConsentModal from './AadhaarConsentModal';
import AadhaarVerificationModal from './AadhaarVerificationModal';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowUpRight,
  Recycle,
  Truck,
  Building2,
  Shield,
  Fingerprint,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import styles from './AuthPage.module.css';
import MaterialFlow from '@/components/material-flow/MaterialFlow';

interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: 'recycler' | 'collector' | 'admin' | 'citizen';
  roleLabel: string;
  roleDescription: string;
  initial: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const getRoleDestination = (role?: string) => {
  if (role === 'citizen') return '/citizen';
  if (role === 'collector') return '/collector';
  if (role === 'admin') return '/admin';
  return '/recycler';
};

export default function AuthPage() {
  const router = useRouter();
  const { t } = useLocale();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<'collector' | 'recycler' | 'admin' | 'citizen'>('collector');

  // Aadhaar Modal States
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  // Email/Password States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [isAltDrawerOpen, setIsAltDrawerOpen] = useState(false);

  const DEMO_ACCOUNTS: DemoAccount[] = [
    {
      id: 'demo-ramesh',
      name: 'Ramesh Kumar',
      email: 'ramesh.collector@scrapsetu.in',
      role: 'collector',
      roleLabel: 'Field Collector',
      roleDescription: 'Field collection and material intake',
      initial: 'R',
      icon: Truck,
    },
    {
      id: 'demo-vinayak',
      name: 'Vinayak Sharma',
      email: 'vinayak.recycler@scrapsetu.in',
      role: 'recycler',
      roleLabel: 'Authorized Recycler',
      roleDescription: 'Facility intake and processing workflow',
      initial: 'V',
      icon: Building2,
    },
    {
      id: 'demo-citizen',
      name: 'Aarav',
      email: 'citizen@scrapsetu.in',
      role: 'citizen',
      roleLabel: 'Citizen',
      roleDescription: 'Estimate materials and book a pickup',
      initial: 'A',
      icon: Recycle,
    },
    {
      id: 'demo-admin',
      name: 'Priya Verma',
      email: 'priya.admin@scrapsetu.in',
      role: 'admin',
      roleLabel: 'Platform Admin',
      roleDescription: 'Network governance and operations',
      initial: 'P',
      icon: Shield,
    },
  ];

  useEffect(() => {
    let isMounted = true;
    if (isSupabaseConfigured) {
      const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && isMounted) {
          setHasExistingSession(true);
          router.push('/recycler');
        }
      });

      return () => {
        isMounted = false;
        authSubscription?.subscription?.unsubscribe();
      };
    }
  }, [router]);

  // Aadhaar flow triggers
  const handleStartAadhaar = () => {
    setErrorMessage(null);
    setIsConsentOpen(true);
  };

  const handleConsentAccepted = () => {
    setIsConsentOpen(false);
    setIsVerificationOpen(true);
  };

  const handleVerificationSuccess = (destinationUrl: string, _user: any) => {
    setIsVerificationOpen(false);
    setHasExistingSession(true);
    router.push(destinationUrl || getRoleDestination(selectedRole));
  };

  // Demo account instant login
  const handleQuickPilotLogin = (account: DemoAccount) => {
    setSelectedRole(account.role);
    setIsLoading(true);
    setErrorMessage(null);

    localStorage.setItem(
      'scrapsetu_auth_user',
      JSON.stringify({
        name: account.name,
        email: account.email,
        role: account.role,
        isAadhaarVerified: true,
      })
    );

    setHasExistingSession(true);
    setTimeout(() => {
      router.push(getRoleDestination(account.role));
    }, 200);
  };

  // Preserved Google OAuth
  const handleDirectOAuth = async () => {
    if (isLoading || isGoogleLoading) return;

    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${redirectOrigin}/auth`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      setIsGoogleLoading(false);
      setErrorMessage("We couldn't connect to Google. Please try again.");
    }
  };

  // Email + Password fallback
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isGoogleLoading) return;

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!isSupabaseConfigured) {
        const demoUser = {
          name: email.split('@')[0],
          email: email.trim(),
          role: selectedRole,
        };
        localStorage.setItem('scrapsetu_auth_user', JSON.stringify(demoUser));
        setHasExistingSession(true);
        setTimeout(() => {
          router.push(getRoleDestination(demoUser.role));
        }, 200);
        return;
      }

      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          localStorage.setItem(
            'scrapsetu_auth_user',
            JSON.stringify({
              name: data.session.user.email?.split('@')[0] || 'User',
              email: data.session.user.email,
              role: selectedRole,
            })
          );
          setHasExistingSession(true);
          router.push(getRoleDestination(selectedRole));
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          localStorage.setItem(
            'scrapsetu_auth_user',
            JSON.stringify({
              name: data.session.user.email?.split('@')[0] || 'User',
              email: data.session.user.email,
              role: selectedRole,
            })
          );
          setHasExistingSession(true);
          router.push(getRoleDestination(selectedRole));
        } else {
          setSuccessMessage('Account created! Please check your inbox.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "We couldn't sign you in.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormBusy = isLoading || isGoogleLoading || hasExistingSession;

  return (
    <div className={styles.screen}>
      {/* Left Branding Cover */}
      <aside className={styles.cover}>
        <Link href="/" className={styles.brand}>
          <Recycle size={28} />
          SmartScrapSetu<span>®</span>
        </Link>
        <div className={styles.coverCopy}>
          <span className={styles.eyebrow}><T>DELHI NCR CIRCULAR INFRASTRUCTURE</T></span>
          <h2>
            <T>auth.welcomeBack</T>
            <br />
            <em><T>auth.joinTheLoop</T></em>
          </h2>
          <p>
            <T>A little connection can change where a material’s story goes next.</T>
          </p>
        </div>
        <div className={styles.authFlow}>
          <MaterialFlow compact />
        </div>
        <div className={styles.coverFoot}>
          <span><T>CPCB & DPCC COMPLIANT</T></span>
          <span><T>Every material. A new possibility.</T></span>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main className={styles.formPanel}>
        <div className={styles.topUtilityBar}>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={15} /> <T>common.backToHome</T>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className={styles.formShell}>
          {/* Main Primary Heading */}
          <h1 className={styles.primaryAuthHeading}>
            <T>auth.title</T>
          </h1>
          <p className={styles.primaryAuthSubtitle}>
            <T>auth.description</T>
          </p>

          {/* Role selector before verification */}
          <div className={styles.rolePickerSection}>
            <label className={styles.rolePickerLabel}>
              <T>Select Your Working Role:</T>
            </label>
            <div className={styles.roleSelectorGrid}>
              <button
                type="button"
                className={`${styles.roleCardBtn} ${selectedRole === 'collector' ? styles.roleCardBtnActive : ''}`}
                onClick={() => setSelectedRole('collector')}
              >
                <Truck size={17} />
                <span><T>auth.roleCollector</T></span>
              </button>
              <button
                type="button"
                className={`${styles.roleCardBtn} ${selectedRole === 'recycler' ? styles.roleCardBtnActive : ''}`}
                onClick={() => setSelectedRole('recycler')}
              >
                <Building2 size={17} />
                <span><T>auth.roleRecycler</T></span>
              </button>
              <button
                type="button"
                className={`${styles.roleCardBtn} ${selectedRole === 'citizen' ? styles.roleCardBtnActive : ''}`}
                onClick={() => setSelectedRole('citizen')}
              >
                <Recycle size={17} />
                <span><T>auth.roleCitizen</T></span>
              </button>
              <button
                type="button"
                className={`${styles.roleCardBtn} ${selectedRole === 'admin' ? styles.roleCardBtnActive : ''}`}
                onClick={() => setSelectedRole('admin')}
              >
                <Shield size={17} />
                <span><T>auth.roleAdmin</T></span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className={styles.error}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </p>
          )}
          {successMessage && (
            <p role="status" className={styles.success}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </p>
          )}

          {/* PRIMARY CALL TO ACTION: AADHAAR AUTHENTICATION */}
          <div className={styles.aadhaarCtaCard}>
            <div className={styles.aadhaarBadgeRow}>
              <div className={styles.aadhaarEmblemWrap}>
                <Fingerprint size={24} className={styles.fingerprintIcon} />
              </div>
              <div>
                <span className={styles.aadhaarCtaBadge}><T>UIDAI Verified Identity</T></span>
                <span className={styles.demoPill}><T>auth.demoBadge</T></span>
              </div>
            </div>

            <button
              type="button"
              className={styles.aadhaarPrimaryBtn}
              onClick={handleStartAadhaar}
              disabled={isFormBusy}
            >
              <ShieldCheck size={20} />
              <span><T>auth.verifyWithAadhaar</T></span>
            </button>

            <span className={styles.aadhaarPrivacyNotice}>
              <T>auth.demoNotice</T>
            </span>
          </div>

          {/* Quick Pilot Demo Workspaces */}
          <div className={styles.demoHeader}>
            <span><T>auth.demoModeTitle</T></span>
            <span><T>auth.demoModeSubtitle</T></span>
          </div>
          <div className={styles.demoGrid}>
            {DEMO_ACCOUNTS.map((a) => (
              <button
                disabled={isFormBusy}
                type="button"
                key={a.id}
                onClick={() => handleQuickPilotLogin(a)}
              >
                <a.icon size={20} />
                <span>
                  {a.role === 'collector'
                    ? t('auth.roleCollector')
                    : a.role === 'recycler'
                    ? t('auth.roleRecycler')
                    : a.role === 'citizen'
                    ? t('auth.roleCitizen')
                    : t('auth.roleAdmin')}
                </span>
                <ArrowUpRight size={13} />
              </button>
            ))}
          </div>

          {/* Collapsible Alternative Sign-In Drawer (Google OAuth & Email) */}
          <div className={styles.altSection}>
            <button
              type="button"
              className={styles.altToggleBtn}
              onClick={() => setIsAltDrawerOpen(!isAltDrawerOpen)}
              aria-expanded={isAltDrawerOpen}
            >
              <span><T>auth.alternativeSignIn</T></span>
              <ChevronDown size={15} className={isAltDrawerOpen ? styles.rotate180 : ''} />
            </button>

            {isAltDrawerOpen && (
              <div className={styles.altDrawerContent}>
                {/* Preserved Google OAuth Option */}
                <button
                  type="button"
                  className={styles.google}
                  disabled={isFormBusy}
                  onClick={() => {
                    if (!isSupabaseConfigured) {
                      setErrorMessage(
                        'Google sign-in is not connected in this local preview. Try Aadhaar verification or a demo workspace.'
                      );
                      return;
                    }
                    handleDirectOAuth();
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 01-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0012 22z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.4 13.92A6 6 0 016.4 10.08V7.49H3.06a10 10 0 000 9.02z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.96c1.47 0 2.79.5 3.82 1.49l2.86-2.87A9.6 9.6 0 0012 2a10 10 0 00-8.94 5.49l3.34 2.59C7.19 7.72 9.4 5.96 12 5.96z"
                    />
                  </svg>
                  {isGoogleLoading ? <T>common.loading</T> : <T>auth.googleSignIn</T>}
                </button>

                <div className={styles.divider}>
                  <span><T>common.or</T></span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className={styles.emailForm}>
                  <label htmlFor="auth-email"><T>auth.emailLabel</T></label>
                  <div className={styles.input}>
                    <Mail size={17} />
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isFormBusy}
                    />
                  </div>

                  <label htmlFor="auth-password"><T>auth.passwordLabel</T></label>
                  <div className={styles.input}>
                    <Lock size={17} />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isFormBusy}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={isFormBusy}>
                    {isLoading ? <T>common.loading</T> : <T>auth.signIn</T>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Aadhaar Modals */}
      <AadhaarConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        onAccept={handleConsentAccepted}
        role={selectedRole}
      />

      <AadhaarVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        role={selectedRole}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
