import mongoose from 'mongoose';

const requiredIfCompleted = function() {
  return this.status === 'completed';
};

const inspectorSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  signature: {
    type: String, // Base64 encoded signature image
  },
}, { _id: false });

const weatherConditionsSchema = new mongoose.Schema({
  Sunny: {
    type: Boolean,
    default: false,
  },
  Cloudy: {
    type: Boolean,
    default: false,
  },
  Windy: {
    type: Boolean,
    default: false,
  },
  snowInches: {
    type: String,
    default: '0',
  },
  rainInches: {
    type: String,
    default: '0',
  },
}, { _id: false });

const scaffoldInspectionSchema = new mongoose.Schema({
  inspector: {
    type: String,
    required: requiredIfCompleted,
  },
  jobName: {
    type: String,
    required: requiredIfCompleted,
  },
  siteAddress: {
    type: String,
    required: requiredIfCompleted,
  },
  siteRep: {
    type: String,
    required: requiredIfCompleted,
  },
  generalContractor: {
    type: String,
    default: '',
  },
  gcPhone: {
    type: String,
    default: '',
  },
  dateFrom: {
    type: Date,
    required: requiredIfCompleted,
  },
  dateTo: {
    type: Date,
    required: requiredIfCompleted,
  },
  // Array of 22 inspection items, each containing array of 7 day responses (true/false/null)
  inspectionItems: {
    type: [[mongoose.Schema.Types.Mixed]],
    default: [],
  },
  // Array of 7 inspection times (one per day)
  inspectionTimes: {
    type: [String],
    default: ['', '', '', '', '', '', ''],
  },
  // Array of 7 weather condition objects (one per day)
  inspectionWeather: {
    type: [weatherConditionsSchema],
    default: () => Array(7).fill(null).map(() => ({
      Sunny: false,
      Cloudy: false,
      Windy: false,
      snowInches: '0',
      rainInches: '0'
    })),
  },
  actionComment: {
    type: String,
    default: '',
  },
  inspectors: {
    type: [inspectorSchema],
    required: requiredIfCompleted,
    validate: {
      validator: function(v) {
        if (this.status === 'draft') {
          return true;
        }
        return Array.isArray(v) && v.length > 0 && v.every(inspector => inspector.name && inspector.name.trim().length > 0);
      },
      message: 'At least one inspector with a name is required',
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

const ScaffoldInspection = mongoose.model('ScaffoldInspection', scaffoldInspectionSchema);

export default ScaffoldInspection;
