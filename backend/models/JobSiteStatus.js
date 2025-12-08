import mongoose from 'mongoose';

const jobSiteStatusSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  archivedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Create compound index to ensure uniqueness for jobName + address combination
jobSiteStatusSchema.index({ jobName: 1, address: 1 }, { unique: true });

const JobSiteStatus = mongoose.model('JobSiteStatus', jobSiteStatusSchema);

export default JobSiteStatus;
