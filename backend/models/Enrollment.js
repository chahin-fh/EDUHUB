const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  moduleId: mongoose.Schema.Types.ObjectId,
  lessonId: mongoose.Schema.Types.ObjectId,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  timeSpent: Number // en minutes
});

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Paiement
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  amountPaid: Number,
  paymentDate: Date,
  paymentMethod: String,
  transactionId: String,
  
  // Progrès
  progress: [progressSchema],
  completionPercentage: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Certificat
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: Date,
  certificateId: String,
  
  // Dates
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: Date,
  completedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Index composé pour éviter doubles inscriptions
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);