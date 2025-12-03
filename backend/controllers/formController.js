import SafetyMeeting from '../models/SafetyMeeting.js';
import VehicleInspection from '../models/VehicleInspection.js';
import DailyLog from '../models/DailyLog.js';
import ScaffoldInspection from '../models/ScaffoldInspection.js';
import User from '../models/User.js';
import { logFormError } from '../utils/logger.js';
import {
  generateDailyLogPDF,
  generateVehicleInspectionPDF,
  generateSafetyMeetingPDF,
  generateScaffoldInspectionPDF
} from '../utils/pdfGenerator.js';

const sanitizeFormData = (data) => {
  if (data === '') {
    return undefined;
  }

  if (data === null) {
    return null;
  }

  if (Array.isArray(data)) {
    return data
      .map(item => sanitizeFormData(item))
      .filter(item => item !== undefined);
  }

  if (typeof data === 'object') {
    return Object.entries(data).reduce((acc, [key, value]) => {
      const sanitizedValue = sanitizeFormData(value);
      if (sanitizedValue !== undefined) {
        acc[key] = sanitizedValue;
      }
      return acc;
    }, {});
  }

  return data;
};

const escapePDFText = (text = '') =>
  text
    .toString()
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const wrapText = (text = '', maxLength = 90) => {
  const str = text?.toString() || '';
  if (!str.trim()) {
    return [''];
  }

  const words = str.split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [''];
};

const generateSimplePDF = (title, bodyLines = []) => {
  const linesToRender = [];
  linesToRender.push({ text: title, fontSize: 18 });
  linesToRender.push({ text: '' });

  bodyLines.forEach((line) => {
    if (line === undefined || line === null) {
      return;
    }
    const wrapped = wrapText(line);
    if (wrapped.length === 0) {
      linesToRender.push({ text: '' });
      return;
    }
    wrapped.forEach((wrappedLine) => {
      linesToRender.push({ text: wrappedLine });
    });
  });

  let yPosition = 760;
  const content = linesToRender
    .map(({ text, fontSize = 12 }) => {
      if (!text) {
        yPosition -= 10;
        return null;
      }

      const safeText = escapePDFText(text);
      const currentY = Math.max(yPosition, 60);
      yPosition -= fontSize + 6;

      return [
        'BT',
        `/F1 ${fontSize} Tf`,
        `72 ${currentY} Td`,
        `(${safeText}) Tj`,
        'ET'
      ].join('\n');
    })
    .filter(Boolean)
    .join('\n');

  const contentLength = Buffer.byteLength(content, 'utf-8');

  const objects = [
    '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj',
    '2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj',
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj',
    `4 0 obj<< /Length ${contentLength} >>stream\n${content}\nendstream\nendobj`,
    '5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj'
  ];

  const chunks = ['%PDF-1.4\n'];
  const offsets = [];
  let length = Buffer.byteLength(chunks[0], 'utf-8');

  objects.forEach((obj) => {
    offsets.push(length);
    const chunk = `${obj}\n`;
    chunks.push(chunk);
    length += Buffer.byteLength(chunk, 'utf-8');
  });

  const xrefStart = length;
  const totalObjects = offsets.length + 1;
  let xref = `xref\n0 ${totalObjects}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    xref += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  const trailer = `trailer<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const pdfString = chunks.join('') + xref + trailer;
  return Buffer.from(pdfString, 'utf-8');
};

const formTypeLabels = {
  'safety-meeting': 'Safety Meeting',
  'vehicle-inspection': 'Vehicle Inspection',
  'daily-log': 'Daily Log',
  'scaffold-inspection': 'Scaffold Inspection'
};

const jobSiteConfigs = [
  {
    formType: 'scaffold-inspection',
    model: ScaffoldInspection,
    jobField: 'jobName',
    addressField: 'siteAddress',
  },
  {
    formType: 'daily-log',
    model: DailyLog,
    jobField: 'job',
    addressField: 'jobAddress',
  },
  {
    formType: 'vehicle-inspection',
    model: VehicleInspection,
    jobField: 'jobName',
    addressField: 'jobAddress',
  },
  {
    formType: 'safety-meeting',
    model: SafetyMeeting,
    jobField: 'jobName',
    addressField: 'jobAddress',
  },
];

const formatDateValue = (value, options = {}) => {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }
  return date.toLocaleString('en-US', { ...options });
};

const formatBoolean = (value) => (value ? 'Yes' : 'No');

const formatSectionHeader = (text) => `— ${text} —`;

const formatNestedMap = (mapData = {}, label) => {
  const entries = Object.entries(mapData);
  if (entries.length === 0) {
    return [`${label}: No data`];
  }
  return [label, ...entries.map(([key, value]) => `  • ${key}: ${value || 'N/A'}`)];
};

const formatAttendees = (list = [], descriptor = 'Attendees') => {
  if (!list.length) {
    return [`${descriptor}: None recorded`];
  }
  return [descriptor, ...list.map((item, index) => {
    const parts = [item.name || 'Name missing'];
    if (item.role) {
      parts.push(`Role: ${item.role}`);
    }
    return `  ${index + 1}. ${parts.join(' — ')}`;
  })];
};

const formatFormDetails = (formType, form) => {
  switch (formType) {
    case 'daily-log':
      return [
        `Job: ${form.job || 'N/A'}`,
        `Date: ${formatDateValue(form.date, { dateStyle: 'medium' })}`,
        `Person in Charge: ${form.personInCharge || 'N/A'}`,
        `Completed By: ${form.personCompletingLog || 'N/A'}`,
        `Weather: ${form.weather || 'N/A'}`,
        `Backcharges To: ${form.backchargesTo || 'N/A'}`,
        `BC Description: ${form.bcDescription || 'N/A'}`,
        `Equipment Used: ${form.equipmentUsed || 'N/A'}`,
        `Subcontractors Onsite: ${form.subcontractorsOnsite || 'N/A'}`,
        formatSectionHeader('Daily Report'),
        form.dailyReport || 'N/A',
        `Change Orders: ${form.changeOrders || 'N/A'}`
      ];
    case 'vehicle-inspection':
      return [
        `Operator Name: ${form.operatorName || 'N/A'}`,
        `Date: ${formatDateValue(form.date, { dateStyle: 'medium' })}`,
        `Time: ${form.time || 'N/A'}`,
        `Vehicle Number: ${form.vehicleNumber || 'N/A'}`,
        `Odometer: ${form.odometerReading ?? 'N/A'}`,
        `Vehicle Satisfactory: ${formatBoolean(form.vehicleSatisfactory)}`,
        `Defects Corrected: ${formatBoolean(form.defectsCorrected)}`,
        `Defects Need Not Be Corrected: ${formatBoolean(form.defectsNeedNotBeCorrected)}`,
        formatSectionHeader('Tractor Inspection'),
        ...formatNestedMap(form.tractorItems || {}, 'Items'),
        formatSectionHeader('Equipment Inspection'),
        ...formatNestedMap(form.equipmentItems || {}, 'Items'),
        formatSectionHeader('Trailer Inspection'),
        ...formatNestedMap(form.trailerItems || {}, 'Items'),
        `Trailer Unit Description: ${form.trailerUnitDescription || 'N/A'}`,
        `Remarks: ${form.remarks || 'N/A'}`,
        ...formatAttendees(form.attendees, 'Sign-offs')
      ];
    case 'safety-meeting':
      return [
        `Job Name: ${form.jobName || 'N/A'}`,
        `Date: ${formatDateValue(form.date, { dateStyle: 'medium' })}`,
        `Topic: ${form.topic || 'N/A'}`,
        `Recommendations: ${form.recommendations || 'N/A'}`,
        ...formatAttendees(form.attendees)
      ];
    case 'scaffold-inspection':
      return [
        `Inspector: ${form.inspector || 'N/A'}`,
        `Job Name: ${form.jobName || 'N/A'}`,
        `Site Address: ${form.siteAddress || 'N/A'}`,
        `Site Rep: ${form.siteRep || 'N/A'}`,
        `General Contractor: ${form.generalContractor || 'N/A'}`,
        `GC Phone: ${form.gcPhone || 'N/A'}`,
        `Date From: ${formatDateValue(form.dateFrom, { dateStyle: 'medium' })}`,
        `Date To: ${formatDateValue(form.dateTo, { dateStyle: 'medium' })}`,
        formatSectionHeader('Inspection Notes'),
        form.actionComment || 'No action comments recorded.',
        ...formatAttendees(form.inspectors, 'Inspectors')
      ];
    default:
      return Object.entries(form).map(([key, value]) => `${key}: ${value}`);
  }
};

// Get the correct model based on form type
const getModel = (formType) => {
  const models = {
    'safety-meeting': SafetyMeeting,
    'vehicle-inspection': VehicleInspection,
    'daily-log': DailyLog,
    'scaffold-inspection': ScaffoldInspection,
  };
  return models[formType];
};

// Create a new form
export const createForm = async (req, res) => {
  let sanitizedData;
  try {
    const { formType } = req.params;
    const Model = getModel(formType);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid form type' });
    }

    sanitizedData = sanitizeFormData(req.body);

    // Add user information if form is completed and user is authenticated
    if (sanitizedData.status === 'completed' && req.userId) {
      const user = await User.findById(req.userId);
      if (user) {
        sanitizedData.completedByUser = user._id;
        sanitizedData.completedByName = user.fullName;
      }
    }

    const form = new Model(sanitizedData);
    await form.save();

    res.status(201).json({
      message: 'Form created successfully',
      data: form,
    });
  } catch (error) {
    logFormError('createForm', {
      formType,
      originalBody: req.body,
      sanitizedBody: sanitizedData,
      error: error.message,
      stack: error.stack,
    });
    console.error('Error creating form:', error);
    res.status(500).json({
      message: 'Error creating form',
      error: error.message
    });
  }
};

// Get all forms of a specific type
export const getForms = async (req, res) => {
  try {
    const { formType } = req.params;
    const { limit = 10, status } = req.query;
    const Model = getModel(formType);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid form type' });
    }

    const query = status ? { status } : {};
    const forms = await Model.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      message: 'Forms retrieved successfully',
      data: forms,
      count: forms.length,
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({
      message: 'Error fetching forms',
      error: error.message
    });
  }
};

// Get a single form by ID
export const getFormById = async (req, res) => {
  try {
    const { formType, id } = req.params;
    const Model = getModel(formType);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid form type' });
    }

    const form = await Model.findById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({
      message: 'Form retrieved successfully',
      data: form,
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({
      message: 'Error fetching form',
      error: error.message
    });
  }
};

// Update a form
export const updateForm = async (req, res) => {
  let sanitizedData;
  try {
    const { formType, id } = req.params;
    const Model = getModel(formType);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid form type' });
    }

    sanitizedData = sanitizeFormData(req.body);

    // Add user information if status is changing to completed and user is authenticated
    if (sanitizedData.status === 'completed' && req.userId) {
      const user = await User.findById(req.userId);
      if (user) {
        sanitizedData.completedByUser = user._id;
        sanitizedData.completedByName = user.fullName;
      }
    }

    const form = await Model.findByIdAndUpdate(
      id,
      { ...sanitizedData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({
      message: 'Form updated successfully',
      data: form,
    });
  } catch (error) {
    logFormError('updateForm', {
      formType,
      id,
      originalBody: req.body,
      sanitizedBody: sanitizedData,
      error: error.message,
      stack: error.stack,
    });
    console.error('Error updating form:', error);
    res.status(500).json({
      message: 'Error updating form',
      error: error.message
    });
  }
};

// Delete a form
export const deleteForm = async (req, res) => {
  try {
    const { formType, id } = req.params;
    const Model = getModel(formType);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid form type' });
    }

    const form = await Model.findByIdAndDelete(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({
      message: 'Form deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({
      message: 'Error deleting form',
      error: error.message
    });
  }
};

// Export form to PDF with proper formatting
export const exportFormToPDF = async (req, res) => {
  try {
    const { formType, id } = req.params;
    const Model = getModel(formType);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid form type' });
    }

    const form = await Model.findById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const plainForm = form.toObject();
    let doc;

    // Generate PDF based on form type
    switch (formType) {
      case 'daily-log':
        doc = generateDailyLogPDF(plainForm);
        break;
      case 'vehicle-inspection':
        doc = generateVehicleInspectionPDF(plainForm);
        break;
      case 'safety-meeting':
        doc = generateSafetyMeetingPDF(plainForm);
        break;
      case 'scaffold-inspection':
        doc = generateScaffoldInspectionPDF(plainForm);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported form type for PDF export' });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${formType}-${id}.pdf"`);

    // Pipe the PDF document to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error exporting form:', error);
    res.status(500).json({
      message: 'Error exporting form',
      error: error.message
    });
  }
};

export const getJobSites = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '15', 10);
    const collectedSites = [];

    for (const config of jobSiteConfigs) {
      const { model, formType, jobField, addressField } = config;
      const docs = await model.find({ [addressField]: { $exists: true, $ne: '' } })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select(`${jobField} ${addressField} status updatedAt`);

      docs.forEach(doc => {
        const jobName = doc[jobField];
        const address = doc[addressField];
        if (!address) {
          return;
        }
        collectedSites.push({
          formType,
          jobName: jobName || 'Untitled Job',
          address,
          status: doc.status,
          updatedAt: doc.updatedAt,
        });
      });
    }

    const uniqueSites = [];
    const seen = new Set();

    collectedSites.forEach(site => {
      const key = `${site.jobName}-${site.address}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSites.push(site);
      }
    });

    res.status(200).json({
      message: 'Job sites retrieved successfully',
      data: uniqueSites.slice(0, limit),
      count: uniqueSites.length,
    });
  } catch (error) {
    console.error('Error fetching job sites:', error);
    res.status(500).json({
      message: 'Error fetching job sites',
      error: error.message,
    });
  }
};
