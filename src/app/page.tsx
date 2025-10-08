import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 transition-colors">
      
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            🔐 Password Vault
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Secure password management with client-side encryption. Your passwords are encrypted on your device before reaching our servers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg border border-gray-200 dark:border-gray-600"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transition-colors">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Client-Side Encryption
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your passwords are encrypted using AES-GCM in your browser before being sent to our servers. We never see your data in plain text.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transition-colors">
            <div className="text-3xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Password Generator
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Generate strong, unique passwords with customizable options including length, character types, and exclusion of look-alike characters.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transition-colors">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Fast & Simple
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Clean, minimal interface designed for speed. Auto-clearing clipboard, quick search, and instant access to your passwords.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 max-w-2xl mx-auto transition-colors">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">Privacy First</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  <strong>Zero-knowledge architecture:</strong> Your master password and vault data are never stored or transmitted in plain text. 
                  All encryption happens client-side using industry-standard AES-GCM with PBKDF2 key derivation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-gray-600 dark:text-gray-400">
          <p>Built with Next.js, TypeScript, and MongoDB</p>
          <div className="mt-2 flex justify-center space-x-4">
            <span>🔐 AES-GCM Encryption</span>
            <span>•</span>
            <span>🛡️ PBKDF2 Key Derivation</span>
            <span>•</span>
            <span>📋 Auto-clearing Clipboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
