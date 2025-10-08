'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PasswordOptions } from '@/types';
import { generatePassword, calculatePasswordStrength, generatePasswordSuggestions } from '@/lib/passwordGenerator';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  defaultOptions?: Partial<PasswordOptions>;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onPasswordGenerated,
  defaultOptions = {}
}) => {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeLookAlikes: false,
    ...defaultOptions
  });

  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    description: string;
    feedback: string[];
  } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleGeneratePassword = useCallback(() => {
    try {
      const password = generatePassword(options);
      setGeneratedPassword(password);
      setPasswordStrength(calculatePasswordStrength(password));
      
      // Generate suggestions
      const newSuggestions = generatePasswordSuggestions(options, 3)
        .filter(p => p !== password)
        .slice(0, 2);
      setSuggestions(newSuggestions);
      
      onPasswordGenerated?.(password);
    } catch (error) {
      console.error('Password generation error:', error);
      setGeneratedPassword('');
      setPasswordStrength(null);
      setSuggestions([]);
    }
  }, [options, onPasswordGenerated]);

  // Generate password whenever options change
  useEffect(() => {
    handleGeneratePassword();
  }, [handleGeneratePassword]);

  const handleCopyToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopySuccess(true);
      
      // Clear the timeout if it exists
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
      
      // Auto-clear after 15 seconds
      const timeout = setTimeout(() => {
        navigator.clipboard.writeText('').catch(() => {
          // Ignore errors when clearing clipboard
        });
        setCopySuccess(false);
      }, 15000);
      
      setCopyTimeout(timeout);
      
      // Reset copy success indicator after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const getStrengthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStrengthBarColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Generated Password Display */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Generated Password
        </label>
        <div className="relative">
          <input
            type="text"
            value={generatedPassword}
            readOnly
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Click generate to create a password"
          />
          <button
            onClick={() => handleCopyToClipboard(generatedPassword)}
            disabled={!generatedPassword}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Copy to clipboard (auto-clears in 15s)"
          >
            {copySuccess ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {passwordStrength && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Strength:</span>
              <span className={`text-sm font-medium ${getStrengthColor(passwordStrength.score)}`}>
                {passwordStrength.description} ({passwordStrength.score}/100)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor(passwordStrength.score)}`}
                style={{ width: `${passwordStrength.score}%` }}
              />
            </div>
            {passwordStrength.feedback.length > 0 && (
              <div className="text-xs text-gray-500">
                <span>Suggestions: </span>
                {passwordStrength.feedback.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGeneratePassword}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Generate New Password
      </button>

      {/* Password Length Slider */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Length: {options.length}
        </label>
        <input
          type="range"
          min="4"
          max="50"
          value={options.length}
          onChange={(e) => updateOption('length', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>4</span>
          <span>50</span>
        </div>
      </div>

      {/* Character Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Include Characters
        </label>
        
        <div className="space-y-2">
          {[
            { key: 'includeUppercase', label: 'Uppercase Letters (A-Z)' },
            { key: 'includeLowercase', label: 'Lowercase Letters (a-z)' },
            { key: 'includeNumbers', label: 'Numbers (0-9)' },
            { key: 'includeSymbols', label: 'Symbols (!@#$%^&*)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options[key as keyof PasswordOptions] as boolean}
                onChange={(e) => updateOption(key as keyof PasswordOptions, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={options.excludeLookAlikes}
            onChange={(e) => updateOption('excludeLookAlikes', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Exclude Look-alikes (0, O, 1, I, l, |, `)
          </span>
        </label>
      </div>

      {/* Password Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Alternative Suggestions
          </label>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="relative">
                <input
                  type="text"
                  value={suggestion}
                  readOnly
                  className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setGeneratedPassword(suggestion);
                    setPasswordStrength(calculatePasswordStrength(suggestion));
                    onPasswordGenerated?.(suggestion);
                  }}
                />
                <button
                  onClick={() => handleCopyToClipboard(suggestion)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;