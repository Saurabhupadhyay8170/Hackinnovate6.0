import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Document'
  },
  content: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model('Document', documentSchema);

export default Document; 