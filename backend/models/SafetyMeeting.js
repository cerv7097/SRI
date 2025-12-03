import mongoose from 'mongoose';

const requiredIfCompleted = function() {
  return this.status === 'completed';
};

const attendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  signature: {
    type: String, // Base64 encoded signature image
  },
}, { _id: false });

const safetyMeetingSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: requiredIfCompleted,
  },
  jobName: {
    type: String,
    required: requiredIfCompleted,
  },
  topic: {
    type: String,
    required: requiredIfCompleted,
  },
  recommendations: {
    type: String,
    default: '',
  },
  attendees: {
    type: [attendeeSchema],
    required: requiredIfCompleted,
    validate: {
      validator: function(v) {
        if (this.status === 'draft') {
          return true;
        }
        return Array.isArray(v) && v.length > 0 && v.every(att => att.name && att.name.trim().length > 0);
      },
      message: 'At least one attendee with a name is required',
    },
  },
  status: {
    type: String,
    enum: ['draft', 'completed'],
    default: 'draft',
  },
  completedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  completedByName: {
    type: String,
  }
}, {
  timestamps: true,
});

const SafetyMeeting = mongoose.model('SafetyMeeting', safetyMeetingSchema);

export default SafetyMeeting;
