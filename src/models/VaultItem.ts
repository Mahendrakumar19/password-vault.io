import mongoose, { Document, Schema } from 'mongoose';

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  encryptedData: string; // This will contain encrypted JSON with username, password, url, notes
  iv: string; // Initialization vector for AES-GCM
  authTag: string; // Authentication tag for AES-GCM
  tags: string[]; // Tags for categorization
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  encryptedData: {
    type: String,
    required: [true, 'Encrypted data is required']
  },
  iv: {
    type: String,
    required: [true, 'Initialization vector is required']
  },
  authTag: {
    type: String,
    required: [true, 'Authentication tag is required']
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.every(tag => tag.length <= 50);
      },
      message: 'Tags cannot exceed 50 characters'
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying by user
VaultItemSchema.index({ userId: 1, createdAt: -1 });

// Prevent re-compilation during development
const VaultItem = mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);

export default VaultItem;