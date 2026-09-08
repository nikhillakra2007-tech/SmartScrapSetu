import { AadhaarProviderInterface } from './types';
import { MockAadhaarVerificationProvider } from './mock-provider';
import { ProductionAadhaarVerificationProvider } from './production-provider';

let cachedProvider: AadhaarProviderInterface | null = null;

export function getAadhaarProvider(): AadhaarProviderInterface {
  if (cachedProvider) return cachedProvider;

  const providerType = process.env.AADHAAR_PROVIDER || 'mock';

  if (providerType.toLowerCase() === 'production' || providerType.toLowerCase() === 'prod') {
    cachedProvider = new ProductionAadhaarVerificationProvider();
  } else {
    cachedProvider = new MockAadhaarVerificationProvider();
  }

  return cachedProvider;
}
