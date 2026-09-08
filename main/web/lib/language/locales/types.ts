export type LocaleCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'te'
  | 'mr'
  | 'ta'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur'
  | 'mai'
  | 'ne'
  | 'kok'
  | 'sd'
  | 'dog';

export interface LanguageMeta {
  code: LocaleCode;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  searchTerms: string;
}

export interface TranslationSchema {
  // Common & UI Shell
  'common.appName': string;
  'common.continue': string;
  'common.cancel': string;
  'common.retry': string;
  'common.close': string;
  'common.save': string;
  'common.selectLanguage': string;
  'common.loading': string;
  'common.or': string;
  'common.backToHome': string;

  // Authentication & Verification
  'auth.title': string;
  'auth.description': string;
  'auth.verifyWithAadhaar': string;
  'auth.demoBadge': string;
  'auth.demoNotice': string;
  'auth.signIn': string;
  'auth.createAccount': string;
  'auth.welcomeBack': string;
  'auth.joinTheLoop': string;
  'auth.subtitleSignIn': string;
  'auth.subtitleSignUp': string;
  'auth.alternativeSignIn': string;
  'auth.googleSignIn': string;
  'auth.demoModeTitle': string;
  'auth.demoModeSubtitle': string;
  'auth.roleCollector': string;
  'auth.roleRecycler': string;
  'auth.roleCitizen': string;
  'auth.roleAdmin': string;
  'auth.emailLabel': string;
  'auth.passwordLabel': string;

  // Consent Screen
  'auth.consent.title': string;
  'auth.consent.description': string;
  'auth.consent.purposeHeading': string;
  'auth.consent.purposeBody': string;
  'auth.consent.dataHeading': string;
  'auth.consent.dataBody': string;
  'auth.consent.storageHeading': string;
  'auth.consent.storageBody': string;
  'auth.consent.accept': string;
  'auth.consent.cancel': string;

  // Aadhaar Modal Steps
  'auth.verification.modalTitle': string;
  'auth.verification.enterOtpPrompt': string;
  'auth.verification.otpSentNotice': string;
  'auth.verification.otpPlaceholder': string;
  'auth.verification.verifyButton': string;
  'auth.verification.verifying': string;
  'auth.verification.successTitle': string;
  'auth.verification.successMessage': string;
  'auth.verification.failedTitle': string;
  'auth.verification.failedDefault': string;
  'auth.verification.resendOtp': string;

  // Navigation & Tabs
  'nav.aiScanner': string;
  'nav.collectionSchedule': string;
  'nav.myEarnings': string;
  'nav.priceBoard': string;
  'nav.workerSafety': string;
  'nav.facilityHub': string;
  'nav.incomingFeedstock': string;
  'nav.handoverQr': string;
  'nav.rateCards': string;
  'nav.priceEstimator': string;
  'nav.bookPickup': string;
  'nav.signOut': string;

  // 8 Canonical Material Categories
  'cat.plastic': string;
  'cat.glass': string;
  'cat.paper': string;
  'cat.metalFerrous': string;
  'cat.metalNonFerrous': string;
  'cat.eWaste': string;
  'cat.textile': string;
  'cat.rubber': string;
  'cat.materialLabel': string;
  'cat.selectCategory': string;

  // Schedule & Analytics
  'collector.scheduleTitle': string;
  'collector.earningsTitle': string;
  'collector.totalWeight': string;
  'collector.completedPickups': string;
  'collector.avgPerPickup': string;
  'collector.topMaterials': string;
  'collector.todaysExpected': string;
  'collector.routeDistance': string;
  'collector.tabToday': string;
  'collector.tabUpcoming': string;
  'collector.tabCompleted': string;
  'collector.btnAccept': string;
  'collector.btnReject': string;
  'collector.btnStartPickup': string;
  'collector.btnComplete': string;
}
