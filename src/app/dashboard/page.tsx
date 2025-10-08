'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PasswordGenerator from '@/components/PasswordGenerator';
import { DecryptedVaultItem, VaultItemForm } from '@/types';
import { encryptVaultItem, decryptVaultItem } from '@/lib/encryption';

const DashboardPage: React.FC = () => {
  const { user, logout, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [vaultItems, setVaultItems] = useState<DecryptedVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPasswordPrompt, setShowMasterPasswordPrompt] = useState(false);
  const [formData, setFormData] = useState<VaultItemForm>({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load vault items when user is authenticated
  useEffect(() => {
    if (user && masterPassword) {
      loadVaultItems();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, masterPassword]);

  // Prompt for master password on first load
  useEffect(() => {
    if (user && !masterPassword) {
      setShowMasterPasswordPrompt(true);
    }
  }, [user, masterPassword]);

  const loadVaultItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vault', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const decryptedItems: DecryptedVaultItem[] = [];
        
        for (const item of data.data.items) {
          try {
            // Get salt from localStorage (stored during first encryption)
            const salt = localStorage.getItem('vault_salt');
            if (!salt) {
              throw new Error('Master key salt not found');
            }

            const decryptedData = await decryptVaultItem(
              item.encryptedData,
              item.iv,
              item.authTag,
              salt,
              masterPassword
            );

            decryptedItems.push({
              ...item,
              ...decryptedData,
            });
          } catch (decryptError) {
            console.error('Failed to decrypt item:', item.title, decryptError);
            // Continue with other items even if one fails
          }
        }

        setVaultItems(decryptedItems);
      } else {
        setError(data.error || 'Failed to load vault items');
      }
    } catch (err) {
      console.error('Load vault items error:', err);
      setError('Network error while loading vault items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterPasswordSubmit = (password: string) => {
    setMasterPassword(password);
    setShowMasterPasswordPrompt(false);
    // Store salt for future use
    if (!localStorage.getItem('vault_salt')) {
      // This will be set when the first item is encrypted
    }
  };

  const handleAddItem = async () => {
    if (!masterPassword) {
      setError('Master password is required');
      return;
    }

    try {
      const encrypted = await encryptVaultItem(
        {
          username: formData.username,
          password: formData.password,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
        },
        masterPassword
      );

      // Store salt for future use
      localStorage.setItem('vault_salt', encrypted.salt);

      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          encryptedData: encrypted.encryptedData,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add to local state
        const newDecryptedItem: DecryptedVaultItem = {
          _id: data.data.item._id,
          userId: data.data.item.userId,
          title: formData.title,
          username: formData.username,
          password: formData.password,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
          tags: data.data.item.tags ?? [],
          createdAt: data.data.item.createdAt,
          updatedAt: data.data.item.updatedAt,
        };

        setVaultItems(prev => [newDecryptedItem, ...prev]);
        resetForm();
        setShowAddForm(false);
      } else {
        setError(data.error || 'Failed to add vault item');
      }
    } catch (err) {
      console.error('Add item error:', err);
      setError('Failed to encrypt and save item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !masterPassword) return;

    try {
      const encrypted = await encryptVaultItem(
        {
          username: formData.username,
          password: formData.password,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
        },
        masterPassword
      );

      const response = await fetch(`/api/vault/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          encryptedData: encrypted.encryptedData,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setVaultItems(prev => prev.map(item => 
          item._id === editingItem._id 
            ? {
                ...item,
                title: formData.title,
                username: formData.username,
                password: formData.password,
                url: formData.url || undefined,
                notes: formData.notes || undefined,
                updatedAt: data.data.item.updatedAt,
              }
            : item
        ));
        resetForm();
        setEditingItem(null);
      } else {
        setError(data.error || 'Failed to update vault item');
      }
    } catch (err) {
      console.error('Update item error:', err);
      setError('Failed to encrypt and update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/vault/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setVaultItems(prev => prev.filter(item => item._id !== itemId));
      } else {
        setError(data.error || 'Failed to delete vault item');
      }
    } catch (err) {
      console.error('Delete item error:', err);
      setError('Failed to delete item');
    }
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [field]: true }));
      
      // Auto-clear clipboard after 15 seconds
      setTimeout(() => {
        navigator.clipboard.writeText('').catch(() => {});
      }, 15000);
      
      // Reset copy success indicator after 2 seconds
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      username: '',
      password: '',
      url: '',
      notes: '',
    });
  };

  const startEdit = (item: DecryptedVaultItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      username: item.username,
      password: item.password,
      url: item.url || '',
      notes: item.notes || '',
    });
    setShowAddForm(true);
  };

  const filteredItems = vaultItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <header className="bg-gray-100 dark:bg-gray-900 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">Password Vault</h1>
              <p className="text-sm text-gray-700 dark:text-gray-300">Welcome back, {user.name || user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                🎲 Generator
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setEditingItem(null);
                  setShowAddForm(!showAddForm);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                ➕ Add Item
              </button>
              <button
                onClick={logout}
                className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2 text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vault items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
                <button
                  onClick={() => setError('')}
                  className="ml-2 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300"
                >
                  ×
                </button>
              </div>
            )}

            {/* Vault Items */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-black dark:text-white">Loading vault items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-black dark:text-white">No vault items</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No items match your search.' : 'Get started by adding your first password.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item._id} className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-6 transition-colors duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-black dark:text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.username}</p>
                        {item.url && (
                          <a
                            href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                          >
                            {item.url}
                          </a>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleCopyToClipboard(item.username, `username-${item._id}`)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                          title="Copy username"
                        >
                          {copySuccess[`username-${item._id}`] ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyToClipboard(item.password, `password-${item._id}`)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                          title="Copy password (auto-clears in 15s)"
                        >
                          {copySuccess[`password-${item._id}`] ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            {/* Password Generator */}
            {showPasswordGenerator && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
                <h3 className="text-lg font-medium text-black dark:text-white mb-4">Password Generator</h3>
                <PasswordGenerator
                  onPasswordGenerated={(password) => {
                    if (showAddForm) {
                      setFormData(prev => ({ ...prev, password }));
                    }
                  }}
                />
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-6 transition-colors duration-300">
                <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  if (editingItem) {
                    handleUpdateItem();
                  } else {
                    handleAddItem();
                  }
                }}>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="e.g., Gmail, Facebook, Bank"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Username/Email *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Username or email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                    >
                      {editingItem ? 'Update' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Master Password Prompt Modal */}
      {showMasterPasswordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-300 dark:border-gray-700">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Enter Master Password
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              This password will be used to encrypt your vault items. Make sure it&apos;s strong and memorable.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const password = (e.target as HTMLFormElement).masterPassword.value;
              if (password) {
                handleMasterPasswordSubmit(password);
              }
            }}>
              <input
                name="masterPassword"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your master password"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;