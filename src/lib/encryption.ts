import { VaultItemData } from '@/types';

/**
 * Client-side encryption utilities using AES-GCM
 * All encryption/decryption happens in the browser, server never sees plaintext
 */

// Utility functions for base64 conversion
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generate a key from user's password using PBKDF2
export const deriveKeyFromPassword = async (
  password: string,
  salt: ArrayBuffer
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Generate a random salt
export const generateSalt = (): ArrayBuffer => {
  return crypto.getRandomValues(new Uint8Array(16)).buffer;
};

// Generate a random IV
export const generateIV = (): ArrayBuffer => {
  return crypto.getRandomValues(new Uint8Array(12)).buffer;
};

// Encrypt vault item data
export const encryptVaultItem = async (
  data: VaultItemData,
  masterPassword: string
): Promise<{
  encryptedData: string;
  iv: string;
  authTag: string;
  salt: string;
}> => {
  try {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKeyFromPassword(masterPassword, salt);

    const encoder = new TextEncoder();
    const plaintext = encoder.encode(JSON.stringify(data));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      plaintext
    );

    // AES-GCM returns ciphertext + auth tag combined
    const encryptedArray = new Uint8Array(encrypted);
    const ciphertext = encryptedArray.slice(0, -16); // All but last 16 bytes
    const authTag = encryptedArray.slice(-16); // Last 16 bytes

    return {
      encryptedData: arrayBufferToBase64(ciphertext.buffer),
      iv: arrayBufferToBase64(iv),
      authTag: arrayBufferToBase64(authTag.buffer),
      salt: arrayBufferToBase64(salt),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt vault item data
export const decryptVaultItem = async (
  encryptedData: string,
  iv: string,
  authTag: string,
  salt: string,
  masterPassword: string
): Promise<VaultItemData> => {
  try {
    const key = await deriveKeyFromPassword(
      masterPassword,
      base64ToArrayBuffer(salt)
    );

    // Combine ciphertext and auth tag for AES-GCM
    const ciphertext = base64ToArrayBuffer(encryptedData);
    const authTagArray = base64ToArrayBuffer(authTag);
    const combined = new Uint8Array(ciphertext.byteLength + authTagArray.byteLength);
    combined.set(new Uint8Array(ciphertext));
    combined.set(new Uint8Array(authTagArray), ciphertext.byteLength);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: base64ToArrayBuffer(iv),
      },
      key,
      combined
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decrypted);
    
    return JSON.parse(decryptedText) as VaultItemData;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - invalid password or corrupted data');
  }
};

// Store salt securely in localStorage (in a real app, consider more secure storage)
export const storeMasterKeySalt = (salt: string): void => {
  localStorage.setItem('vault_salt', salt);
};

export const getMasterKeySalt = (): string | null => {
  return localStorage.getItem('vault_salt');
};

// Clear sensitive data from memory (basic cleanup)
export const clearSensitiveData = (): void => {
  // Clear any sensitive data from localStorage if needed
  // This is called on logout
};

// Export vault data to encrypted JSON file
export const exportVaultData = async (
  vaultItems: VaultItemData[],
  masterPassword: string
): Promise<Blob> => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    itemCount: vaultItems.length,
    items: vaultItems,
  };

  // Encrypt the entire export
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKeyFromPassword(masterPassword, salt);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(exportData));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    plaintext
  );

  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, -16);
  const authTag = encryptedArray.slice(-16);

  const exportObject = {
    version: '1.0',
    encryptedData: arrayBufferToBase64(ciphertext.buffer),
    iv: arrayBufferToBase64(iv),
    authTag: arrayBufferToBase64(authTag.buffer),
    salt: arrayBufferToBase64(salt),
  };

  const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
    type: 'application/json',
  });

  return blob;
};

// Import vault data from encrypted JSON file
export const importVaultData = async (
  fileContent: string,
  masterPassword: string
): Promise<VaultItemData[]> => {
  try {
    const importObject = JSON.parse(fileContent);

    if (!importObject.version || importObject.version !== '1.0') {
      throw new Error('Unsupported export file version');
    }

    const key = await deriveKeyFromPassword(
      masterPassword,
      base64ToArrayBuffer(importObject.salt)
    );

    const ciphertext = base64ToArrayBuffer(importObject.encryptedData);
    const authTagArray = base64ToArrayBuffer(importObject.authTag);
    const combined = new Uint8Array(ciphertext.byteLength + authTagArray.byteLength);
    combined.set(new Uint8Array(ciphertext));
    combined.set(new Uint8Array(authTagArray), ciphertext.byteLength);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: base64ToArrayBuffer(importObject.iv),
      },
      key,
      combined
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decrypted);
    const exportData = JSON.parse(decryptedText);

    return exportData.items || [];
  } catch (error) {
    console.error('Import error:', error);
    throw new Error('Failed to import data - invalid password or corrupted file');
  }
};
