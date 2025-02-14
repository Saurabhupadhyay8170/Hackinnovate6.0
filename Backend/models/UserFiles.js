import mongoose from 'mongoose';

const userFilesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  filesCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  filesShared: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }]
}, {
  timestamps: true
});

export default mongoose.model('UserFiles', userFilesSchema); 