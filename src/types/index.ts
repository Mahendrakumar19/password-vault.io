// User related types
export interface User {
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// Vault item related types
export interface VaultItemData {
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface VaultItem {
  _id: string;
  userId: string;
  title: string;
  encryptedData: string;
  iv: string;
  authTag: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DecryptedVaultItem {
  _id: string;
  userId: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Password generator types
export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeLookAlikes: boolean;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface VaultItemForm {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  tags?: string[];
}