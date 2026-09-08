'use client';

import React from 'react';
import { ShieldCheck, X, FileText, Lock, Info, CheckCircle } from 'lucide-react';
import { T, useLocale } from '@/components/language/Language';
import styles from './AuthPage.module.css';

interface AadhaarConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  role: 'collector' | 'recycler' | 'citizen' | 'admin';
}

export default function AadhaarConsentModal({
  isOpen,
  onClose,
  onAccept,
  role,
}: AadhaarConsentModalProps) {
  const { t } = useLocale();

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      onClick={onClose}
    >
      <div
        className={styles.consentCard}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.consentHeader}>
          <div className={styles.shieldIconWrap}>
            <ShieldCheck size={26} className={styles.shieldIcon} />
          </div>
          <div>
            <h2 id="consent-title" className={styles.consentTitle}>
              <T>auth.consent.title</T>
            </h2>
            <p className={styles.consentSubtitle}>
              <T>auth.consent.description</T>
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.consentBody}>
          <section className={styles.consentSection}>
            <div className={styles.sectionHeader}>
              <Info size={16} className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>
                <T>auth.consent.purposeHeading</T>
              </h3>
            </div>
            <p className={styles.sectionText}>
              <T>auth.consent.purposeBody</T>
            </p>
          </section>

          <section className={styles.consentSection}>
            <div className={styles.sectionHeader}>
              <FileText size={16} className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>
                <T>auth.consent.dataHeading</T>
              </h3>
            </div>
            <p className={styles.sectionText}>
              <T>auth.consent.dataBody</T>
            </p>
          </section>

          <section className={styles.consentSection}>
            <div className={styles.sectionHeader}>
              <Lock size={16} className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>
                <T>auth.consent.storageHeading</T>
              </h3>
            </div>
            <p className={styles.sectionText}>
              <T>auth.consent.storageBody</T>
            </p>
          </section>

          <div className={styles.roleNoticeBadge}>
            <CheckCircle size={15} />
            <span>
              <T>Selected Workspace Role:</T> <strong>{role.toUpperCase()}</strong>
            </span>
          </div>
        </div>

        <div className={styles.consentActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            <T>auth.consent.cancel</T>
          </button>
          <button
            type="button"
            className={styles.agreeBtn}
            onClick={onAccept}
          >
            <T>auth.consent.accept</T>
          </button>
        </div>
      </div>
    </div>
  );
}
