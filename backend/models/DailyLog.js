import mongoose from 'mongoose';

const requiredIfCompleted = function() {
  return this.status === 'completed';
};

const dailyLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: requiredIfCompleted,
  },
  job: {
    type: String,
    required: requiredIfCompleted,
  },
  personInCharge: {
    type: String,
    required: requiredIfCompleted,
  },
  personCompletingLog: {
    type: String,
    required: requiredIfCompleted,
  },
  weather: {
    type: String,
    default: '',
  },
  backchargesTo: {
    type: String,
    default: '',
  },
  bcDescription: {
    type: String,
    default: '',
  },
  equipmentUsed: {
    type: String,
    default: '',
  },
  subcontractorsOnsite: {
    type: String,
    default: '',
  },
  dailyReport: {
    type: String,
    required: requiredIfCompleted,
  },
  changeOrders: {
    type: String,
    default: '',
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

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

export default DailyLog;
