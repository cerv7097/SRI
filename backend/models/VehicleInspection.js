import mongoose from 'mongoose';

const requiredIfCompleted = function() {
  return this.status === 'completed';
};

const attendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['driver', 'mechanic'],
    required: true,
  },
  signature: {
    type: String, // Base64 encoded signature image
  },
}, { _id: false });

const vehicleInspectionSchema = new mongoose.Schema({
  operatorName: {
    type: String,
    required: requiredIfCompleted,
  },
  date: {
    type: Date,
    required: requiredIfCompleted,
  },
  time: {
    type: String,
    required: requiredIfCompleted,
  },
  odometerReading: {
    type: Number,
    required: requiredIfCompleted,
  },
  vehicleNumber: {
    type: String,
    required: requiredIfCompleted,
  },
  // Tractor inspection items (each can be 'ok', 'us', or 'none')
  tractorItems: {
    type: Map,
    of: String,
    default: {},
  },
  // Equipment inspection items (each can be 'ok', 'us', or 'none')
  equipmentItems: {
    type: Map,
    of: String,
    default: {},
  },
  // Trailer inspection items (each can be 'ok', 'us', or 'none')
  trailerItems: {
    type: Map,
    of: String,
    default: {},
  },
  tractorOtherDetail: {
    type: String,
    default: '',
  },
  equipmentOtherDetail: {
    type: String,
    default: '',
  },
  trailerOtherDetail: {
    type: String,
    default: '',
  },
  trailerUnitDescription: {
    type: String,
    default: '',
  },
  remarks: {
    type: String,
    default: '',
  },
  vehicleSatisfactory: {
    type: Boolean,
    default: false,
  },
  attendees: {
    type: [attendeeSchema],
    required: requiredIfCompleted,
    validate: {
      validator: function(v) {
        if (this.status === 'draft') {
          return true;
        }
        return Array.isArray(v) && v.length > 0 && v.every(att => att.name && att.name.trim().length > 0 && att.role);
      },
      message: 'At least one attendee with name and role is required',
    },
  },
  defectsCorrected: {
    type: Boolean,
    default: false,
  },
  defectsNeedNotBeCorrected: {
    type: Boolean,
    default: false,
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

const VehicleInspection = mongoose.model('VehicleInspection', vehicleInspectionSchema);

export default VehicleInspection;
