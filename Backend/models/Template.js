import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true
  },
  templateName: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  description: String,
  structure: {
    title: String,
    chapters: [{
      chapterTitle: String,
      scenes: [String]
    }]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Template = mongoose.model('Template', templateSchema); 

export default Template;