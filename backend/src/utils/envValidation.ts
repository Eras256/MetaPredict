import { logger } from './logger';

export interface EnvVarConfig {
  name: string;
  required: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

/**
 * Validates environment variables on startup
 */
export function validateEnvVars(configs: EnvVarConfig[]): Record<string, string> {
  const validated: Record<string, string> = {};
  const errors: string[] = [];

  for (const config of configs) {
    const value = process.env[config.name];

    // Check if required variable is missing
    if (!value && config.required) {
      errors.push(`Required environment variable ${config.name} is missing`);
      continue;
    }

    // Use default value if provided and value is missing
    const finalValue = value || config.defaultValue || '';

    // Validate value if validator is provided
    if (finalValue && config.validator) {
      if (!config.validator(finalValue)) {
        errors.push(
          config.errorMessage || 
          `Environment variable ${config.name} has invalid value: ${finalValue}`
        );
        continue;
      }
    }

    validated[config.name] = finalValue;
  }

  if (errors.length > 0) {
    logger.error('[EnvValidation] Environment variable validation failed:');
    errors.forEach(error => logger.error(`  - ${error}`));
    throw new Error(`Environment variable validation failed: ${errors.join('; ')}`);
  }

  return validated;
}

/**
 * Common validators
 */
export const validators = {
  /**
   * Validates Ethereum address format
   */
  ethereumAddress: (value: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  },

  /**
   * Validates URL format
   */
  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validates private key format (64 hex characters, with or without 0x prefix)
   */
  privateKey: (value: string): boolean => {
    const cleanKey = value.replace(/^0x/, '').trim();
    return /^[0-9a-fA-F]{64}$/.test(cleanKey);
  },

  /**
   * Validates positive number
   */
  positiveNumber: (value: string): boolean => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  /**
   * Validates non-empty string
   */
  nonEmpty: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Validates one of allowed values
   */
  oneOf: (allowedValues: string[]) => (value: string): boolean => {
    return allowedValues.includes(value);
  },
};

/**
 * Validate critical environment variables for backend
 */
export function validateBackendEnvVars() {
  const configs: EnvVarConfig[] = [
    {
      name: 'RPC_URL_TESTNET',
      required: false,
      defaultValue: 'https://opbnb-testnet-rpc.bnbchain.org',
      validator: validators.url,
      errorMessage: 'RPC_URL_TESTNET must be a valid URL'
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      required: true,
      validator: validators.url,
      errorMessage: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      required: true,
      validator: validators.nonEmpty,
      errorMessage: 'SUPABASE_SERVICE_ROLE_KEY must be set'
    },
    {
      name: 'PRIVATE_KEY',
      required: false,
      validator: (value) => !value || validators.privateKey(value),
      errorMessage: 'PRIVATE_KEY must be a valid 64-character hex string'
    },
    {
      name: 'CHAINLINK_SECRET',
      required: false,
      validator: (value) => !value || validators.nonEmpty(value),
    },
    {
      name: 'GEMINI_API_KEY',
      required: false,
      validator: (value) => !value || validators.nonEmpty(value),
    },
    {
      name: 'NODE_ENV',
      required: false,
      defaultValue: 'development',
      validator: validators.oneOf(['development', 'production', 'test']),
      errorMessage: 'NODE_ENV must be one of: development, production, test'
    },
  ];

  try {
    const validated = validateEnvVars(configs);
    logger.info('[EnvValidation] Environment variables validated successfully');
    return validated;
  } catch (error: any) {
    logger.error(`[EnvValidation] Failed to validate environment variables: ${error.message}`);
    throw error;
  }
}

/**
 * Get environment variable with validation
 */
export function getEnvVar(name: string, defaultValue?: string, validator?: (value: string) => boolean): string {
  const value = process.env[name] || defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set and no default value provided`);
  }

  if (validator && !validator(value)) {
    throw new Error(`Environment variable ${name} has invalid value: ${value}`);
  }

  return value;
}

