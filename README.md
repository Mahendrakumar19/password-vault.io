# 🔐 Password Vault

A secure, privacy-first password manager built with Next.js, TypeScript, and MongoDB. Features client-side AES-GCM encryption ensuring your passwords are never stored in plain text on our servers.

![Password Vault](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)

## ✨ Features

### 🔒 **Privacy & Security First**
- **Client-side AES-GCM encryption** - Your passwords are encrypted in your browser before transmission
- **PBKDF2 key derivation** with 100,000 iterations for master password protection
- **Zero-knowledge architecture** - Server never sees your data in plain text
- **Auto-clearing clipboard** - Copied passwords are automatically cleared after 15 seconds
- **Security headers** - CSP, XSS protection, and other security measures

### 🎲 **Smart Password Generator**
- Customizable length (4-50 characters)
- Multiple character sets (uppercase, lowercase, numbers, symbols)
- Exclude look-alike characters option (0, O, 1, I, l, |, `)
- Real-time password strength analysis
- Multiple password suggestions

### 🏗️ **Vault Management**
- Add, edit, delete vault items
- Store title, username, password, URL, and notes
- Real-time search and filtering
- One-click copy for usernames and passwords
- Clean, minimal interface for speed

### 🔐 **Authentication**
- JWT-based authentication
- Secure password hashing with bcrypt
- Email validation and strong password requirements

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd password-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/password-vault
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/password-vault
   
   # JWT Secret (generate a strong random string)
   JWT_SECRET=your-super-secure-jwt-secret-key-here-change-this-in-production
   
   # Environment
   NODE_ENV=development
   ```

4. **Start MongoDB** (if using local installation)
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
password-vault/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── vault/         # Vault management endpoints
│   │   ├── dashboard/         # Main vault interface
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── layout.tsx        # Root layout with providers
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   └── PasswordGenerator.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── lib/                 # Utility libraries
│   │   ├── auth.ts          # JWT & password utilities
│   │   ├── db.ts            # MongoDB connection
│   │   ├── encryption.ts    # Client-side encryption
│   │   └── passwordGenerator.ts
│   ├── models/              # MongoDB schemas
│   │   ├── User.ts
│   │   └── VaultItem.ts
│   └── types/               # TypeScript type definitions
│       └── index.ts
├── middleware.ts            # Security headers middleware
├── .env.local              # Environment variables
└── package.json
```

## 🔐 Security Architecture

### Client-Side Encryption Process

1. **Key Derivation**: User's master password is combined with a random salt using PBKDF2 (100,000 iterations)
2. **Data Encryption**: Vault items are encrypted using AES-GCM with a random IV
3. **Secure Storage**: Only encrypted data, IV, auth tag, and salt are sent to the server
4. **Decryption**: Data is decrypted client-side when retrieved from the server

### What the Server Never Sees
- ❌ Your master password
- ❌ Your vault item passwords
- ❌ Your vault item data in plain text
- ❌ Your encryption keys

### What the Server Stores
- ✅ Your email address (for login)
- ✅ Hashed account password (bcrypt)
- ✅ Encrypted vault data (AES-GCM)
- ✅ Encryption metadata (IV, auth tag, salt)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/verify` - Verify JWT token

### Vault Management
- `GET /api/vault` - Get all vault items for authenticated user
- `POST /api/vault` - Create new vault item
- `PUT /api/vault/[id]` - Update existing vault item
- `DELETE /api/vault/[id]` - Delete vault item

## 🧪 Testing

### Manual Testing Flow

1. **Registration**: Create new account with email/password
2. **Login**: Sign in with credentials
3. **Master Password**: Set up master password for encryption
4. **Generate Password**: Use password generator with various options
5. **Add Item**: Create new vault item with generated password
6. **Search**: Test search functionality
7. **Copy**: Test clipboard copy with auto-clear
8. **Edit**: Modify existing vault item
9. **Delete**: Remove vault item
10. **Logout**: Sign out and verify session cleanup

### Security Testing

- **Database Inspection**: Verify only encrypted data is stored
- **Network Traffic**: Ensure no plain text passwords in requests
- **Local Storage**: Check for sensitive data leakage
- **Clipboard**: Verify auto-clear functionality

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/password-vault
JWT_SECRET=your-production-jwt-secret-64-characters-long
NODE_ENV=production
```

### Other Platforms
- **Netlify**: Compatible with static export
- **Railway**: Full-stack deployment with MongoDB
- **DigitalOcean App Platform**: Container-based deployment

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Dependencies
- **Next.js 15.5.4** - React framework
- **TypeScript** - Type safety
- **MongoDB & Mongoose** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Tailwind CSS** - Styling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Security Considerations

### For Production Use
- Generate strong, unique JWT secrets (64+ characters)
- Use MongoDB Atlas or secure MongoDB deployment
- Enable HTTPS/TLS for all traffic
- Regular security audits and updates
- Consider additional 2FA implementation
- Monitor for suspicious activities

### Cryptographic Details
- **Encryption**: AES-GCM with 256-bit keys
- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Random Generation**: Crypto.getRandomValues() for salts and IVs
- **Authentication**: HMAC-based authentication tags

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: This README
- **Issues**: GitHub Issues
- **Security**: Report security issues privately

---

Built with ❤️ for privacy and security. Your data belongs to you.

*Note: This is a demonstration project. For production use, consider additional security measures and professional security audits.*
