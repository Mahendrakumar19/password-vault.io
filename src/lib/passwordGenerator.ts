import { PasswordOptions } from '@/types';

// Character sets for password generation
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Characters that can be confused with others (look-alikes)
const LOOK_ALIKES = '0O1Il|`';

/**
 * Generate a secure random password based on the provided options
 * @param options - Password generation options
 * @returns Generated password string
 */
export const generatePassword = (options: PasswordOptions): string => {
  let charset = '';
  
  // Build character set based on options
  if (options.includeLowercase) {
    charset += LOWERCASE;
  }
  
  if (options.includeUppercase) {
    charset += UPPERCASE;
  }
  
  if (options.includeNumbers) {
    charset += NUMBERS;
  }
  
  if (options.includeSymbols) {
    charset += SYMBOLS;
  }
  
  // Remove look-alike characters if requested
  if (options.excludeLookAlikes) {
    charset = charset.split('').filter(char => !LOOK_ALIKES.includes(char)).join('');
  }
  
  // Ensure we have characters to work with
  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }
  
  // Generate password
  let password = '';
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
};

/**
 * Calculate password strength score (0-100)
 * @param password - Password to analyze
 * @returns Strength score and description
 */
export const calculatePasswordStrength = (password: string): {
  score: number;
  description: string;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];
  
  // Length scoring
  if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 8) {
    score += 15;
    feedback.push('Consider using at least 12 characters');
  } else {
    score += 5;
    feedback.push('Password should be at least 8 characters long');
  }
  
  // Character variety scoring
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  
  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
  score += varietyCount * 15;
  
  if (!hasLowercase) feedback.push('Add lowercase letters');
  if (!hasUppercase) feedback.push('Add uppercase letters');
  if (!hasNumbers) feedback.push('Add numbers');
  if (!hasSymbols) feedback.push('Add special characters');
  
  // Pattern checking (basic)
  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  const hasSequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password);
  
  if (hasRepeatingChars) {
    score -= 10;
    feedback.push('Avoid repeating characters');
  }
  
  if (hasSequentialChars) {
    score -= 10;
    feedback.push('Avoid sequential characters');
  }
  
  // Entropy bonus for longer passwords
  if (password.length >= 16) {
    score += 10;
  }
  
  // Cap the score at 100
  score = Math.min(100, Math.max(0, score));
  
  let description = '';
  if (score >= 80) {
    description = 'Very Strong';
  } else if (score >= 60) {
    description = 'Strong';
  } else if (score >= 40) {
    description = 'Medium';
  } else if (score >= 20) {
    description = 'Weak';
  } else {
    description = 'Very Weak';
  }
  
  return { score, description, feedback };
};

/**
 * Check if password contains common patterns
 * @param password - Password to check
 * @returns Array of found patterns
 */
export const checkCommonPatterns = (password: string): string[] => {
  const patterns: string[] = [];
  const lower = password.toLowerCase();
  
  // Common patterns
  const commonPatterns = [
    'password',
    '123456',
    'qwerty',
    'admin',
    'welcome',
    'login',
    'user',
    'guest',
    'test'
  ];
  
  commonPatterns.forEach(pattern => {
    if (lower.includes(pattern)) {
      patterns.push(`Contains common word: ${pattern}`);
    }
  });
  
  return patterns;
};

/**
 * Generate multiple password suggestions
 * @param baseOptions - Base password options
 * @returns Array of generated passwords
 */
export const generatePasswordSuggestions = (baseOptions: PasswordOptions, count: number = 5): string[] => {
  const passwords: string[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const password = generatePassword(baseOptions);
      // Ensure we don't generate duplicates
      if (!passwords.includes(password)) {
        passwords.push(password);
      } else {
        i--; // Retry if duplicate
      }
    } catch (error) {
      console.error('Error generating password suggestion:', error);
      break;
    }
  }
  
  return passwords;
};