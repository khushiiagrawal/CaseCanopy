import mongoose from 'mongoose';
import User, { IUser } from './User';

export interface ICaseSummary extends mongoose.Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  caseId: string;
  pdfUrl?: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const caseSummarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User.modelName,
    required: true,
  },
  caseId: {
    type: String,
    required: [true, 'Please provide a case ID'],
  },
  pdfUrl: {
    type: String,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  likes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Ensure the model is only created once
const CaseSummary = mongoose.models.CaseSummary || mongoose.model<ICaseSummary>('CaseSummary', caseSummarySchema);

export default CaseSummary; 