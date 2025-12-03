import PDFDocument from 'pdfkit';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

// Helper function to add a field to the PDF
const addField = (doc, label, value, y) => {
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text(label, 72, y, { continued: true })
     .font('Helvetica')
     .text(value || 'N/A');
  return y + 20;
};

// Helper function to add a section header
const addSectionHeader = (doc, title, y) => {
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text(title, 72, y);
  doc.moveTo(72, y + 15)
     .lineTo(540, y + 15)
     .stroke('#cbd5e1');
  return y + 25;
};

// Helper function to add a text area
const addTextArea = (doc, label, value, y) => {
  // Check if we need a new page before adding content
  if (y > 680) {
    doc.addPage();
    y = 50;
  }

  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(label, 72, y);

  y += 15;
  doc.fontSize(9)
     .font('Helvetica')
     .text(value || 'N/A', 72, y, {
       width: 468,
       align: 'left'
     });

  const textHeight = doc.heightOfString(value || 'N/A', { width: 468 });
  return y + Math.max(40, textHeight + 10);
};

// Generate Daily Log PDF
export const generateDailyLogPDF = (form) => {
  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('DAILY LOG', 72, 50, { align: 'center' });

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#64748b')
     .text(`Generated: ${formatDate(new Date())}`, 72, 75, { align: 'center' });

  let y = 110;

  // Basic Information
  y = addSectionHeader(doc, 'Basic Information', y);
  doc.fillColor('#000000');
  y = addField(doc, 'Date: ', formatDate(form.date), y);
  y = addField(doc, 'Job: ', form.job, y);
  y = addField(doc, 'Person in Charge: ', form.personInCharge, y);
  y = addField(doc, 'Completed By: ', form.personCompletingLog, y);
  y = addField(doc, 'Weather: ', form.weather, y);

  y += 10;

  // Backcharges
  y = addSectionHeader(doc, 'Backcharges', y);
  doc.fillColor('#000000');
  y = addField(doc, 'Backcharges To: ', form.backchargesTo, y);
  y = addTextArea(doc, 'BC Description:', form.bcDescription, y);

  y += 10;

  // Equipment and Subcontractors
  y = addSectionHeader(doc, 'Equipment & Subcontractors', y);
  doc.fillColor('#000000');
  y = addTextArea(doc, 'Equipment Used:', form.equipmentUsed, y);
  y = addTextArea(doc, 'Subcontractors Onsite:', form.subcontractorsOnsite, y);

  y += 10;

  // Daily Report
  if (y > 680) {
    doc.addPage();
    y = 50;
  }
  y = addSectionHeader(doc, 'Daily Report', y);
  doc.fillColor('#000000');
  y = addTextArea(doc, 'Report:', form.dailyReport, y);

  y += 10;

  // Change Orders
  if (y > 680) {
    doc.addPage();
    y = 50;
  }
  y = addSectionHeader(doc, 'Change Orders', y);
  doc.fillColor('#000000');
  y = addTextArea(doc, 'Change Orders:', form.changeOrders, y);

  return doc;
};

// Generate Vehicle Inspection PDF
export const generateVehicleInspectionPDF = (form) => {
  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('VEHICLE INSPECTION', 72, 50, { align: 'center' });

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#64748b')
     .text(`Generated: ${formatDate(new Date())}`, 72, 75, { align: 'center' });

  let y = 110;

  // Basic Information
  y = addSectionHeader(doc, 'Inspection Details', y);
  doc.fillColor('#000000');
  y = addField(doc, 'Operator Name: ', form.operatorName, y);
  y = addField(doc, 'Date: ', formatDate(form.date), y);
  y = addField(doc, 'Time: ', form.time, y);
  y = addField(doc, 'Vehicle Number: ', form.vehicleNumber, y);
  y = addField(doc, 'Odometer Reading: ', form.odometerReading?.toString(), y);

  y += 10;

  // Vehicle Status
  y = addSectionHeader(doc, 'Vehicle Status', y);
  doc.fillColor('#000000');
  y = addField(doc, 'Vehicle Satisfactory: ', form.vehicleSatisfactory ? 'Yes' : 'No', y);
  y = addField(doc, 'Defects Corrected: ', form.defectsCorrected ? 'Yes' : 'No', y);
  y = addField(doc, 'Defects Need Not Be Corrected: ', form.defectsNeedNotBeCorrected ? 'Yes' : 'No', y);

  y += 10;

  // Tractor Inspection
  if (form.tractorItems && Object.keys(form.tractorItems).length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Tractor Inspection', y);
    doc.fillColor('#000000');

    Object.entries(form.tractorItems).forEach(([key, value]) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      y = addField(doc, `${key}: `, value, y);
    });
    y += 10;
  }

  // Equipment Inspection
  if (form.equipmentItems && Object.keys(form.equipmentItems).length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Equipment Inspection', y);
    doc.fillColor('#000000');

    Object.entries(form.equipmentItems).forEach(([key, value]) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      y = addField(doc, `${key}: `, value, y);
    });
    y += 10;
  }

  // Trailer Inspection
  if (form.trailerItems && Object.keys(form.trailerItems).length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Trailer Inspection', y);
    doc.fillColor('#000000');

    Object.entries(form.trailerItems).forEach(([key, value]) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      y = addField(doc, `${key}: `, value, y);
    });
    y += 10;
  }

  // Additional Information
  if (y > 680) {
    doc.addPage();
    y = 50;
  }
  y = addSectionHeader(doc, 'Additional Information', y);
  doc.fillColor('#000000');
  y = addTextArea(doc, 'Trailer Unit Description:', form.trailerUnitDescription, y);
  y = addTextArea(doc, 'Remarks:', form.remarks, y);

  // Attendees/Sign-offs
  if (form.attendees && form.attendees.length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Sign-offs', y);
    doc.fillColor('#000000');

    form.attendees.forEach((attendee, index) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${attendee.name || 'N/A'}`, 72, y);
      y += 15;
      if (attendee.role) {
        doc.font('Helvetica')
           .text(`   Role: ${attendee.role}`, 72, y);
        y += 15;
      }
      if (attendee.signature) {
        try {
          // Extract base64 data and decode to buffer
          const base64Data = attendee.signature.replace(/^data:image\/\w+;base64,/, '');
          const signatureBuffer = Buffer.from(base64Data, 'base64');
          doc.font('Helvetica')
             .fontSize(9)
             .text('   Signature:', 72, y);
          y += 12;
          doc.image(signatureBuffer, 100, y, { width: 150, height: 40 });
          y += 50;
        } catch (error) {
          console.error('Error rendering signature:', error);
          doc.font('Helvetica')
             .text('   [Signature on file]', 72, y);
          y += 15;
        }
      }
      y += 5;
    });
  }

  return doc;
};

// Generate Safety Meeting PDF
export const generateSafetyMeetingPDF = (form) => {
  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('SAFETY MEETING', 72, 50, { align: 'center' });

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#64748b')
     .text(`Generated: ${formatDate(new Date())}`, 72, 75, { align: 'center' });

  let y = 110;

  // Basic Information
  y = addSectionHeader(doc, 'Meeting Details', y);
  doc.fillColor('#000000');
  y = addField(doc, 'Job Name: ', form.jobName, y);
  y = addField(doc, 'Date: ', formatDate(form.date), y);
  y = addTextArea(doc, 'Topic:', form.topic, y);

  y += 10;

  // Recommendations
  y = addSectionHeader(doc, 'Recommendations', y);
  doc.fillColor('#000000');
  y = addTextArea(doc, 'Recommendations:', form.recommendations, y);

  y += 10;

  // Attendees
  if (form.attendees && form.attendees.length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Attendees', y);
    doc.fillColor('#000000');

    form.attendees.forEach((attendee, index) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${attendee.name || 'N/A'}`, 72, y);
      y += 15;
      if (attendee.signature) {
        try {
          // Extract base64 data and decode to buffer
          const base64Data = attendee.signature.replace(/^data:image\/\w+;base64,/, '');
          const signatureBuffer = Buffer.from(base64Data, 'base64');
          doc.font('Helvetica')
             .fontSize(9)
             .text('   Signature:', 72, y);
          y += 12;
          doc.image(signatureBuffer, 100, y, { width: 150, height: 40 });
          y += 50;
        } catch (error) {
          console.error('Error rendering signature:', error);
          doc.font('Helvetica')
             .text('   [Signature on file]', 72, y);
          y += 15;
        }
      }
      y += 5;
    });
  }

  return doc;
};

// Generate Scaffold Inspection PDF
export const generateScaffoldInspectionPDF = (form) => {
  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('SCAFFOLD INSPECTION', 72, 50, { align: 'center' });

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#64748b')
     .text(`Generated: ${formatDate(new Date())}`, 72, 75, { align: 'center' });

  let y = 110;

  // Basic Information
  y = addSectionHeader(doc, 'Inspection Details', y);
  doc.fillColor('#000000');
  y = addField(doc, 'Inspector: ', form.inspector, y);
  y = addField(doc, 'Job Name: ', form.jobName, y);
  y = addField(doc, 'Site Address: ', form.siteAddress, y);
  y = addField(doc, 'Site Representative: ', form.siteRep, y);
  y = addField(doc, 'General Contractor: ', form.generalContractor, y);
  y = addField(doc, 'GC Phone: ', form.gcPhone, y);
  y = addField(doc, 'Date From: ', formatDate(form.dateFrom), y);
  y = addField(doc, 'Date To: ', formatDate(form.dateTo), y);

  y += 10;

  // Inspection Items
  if (form.inspectionItems && form.inspectionItems.length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Inspection Checklist (7-Day Period)', y);
    doc.fillColor('#000000');

    form.inspectionItems.forEach((item, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${item.description || 'N/A'}`, 72, y);
      y += 15;

      if (item.responses && Array.isArray(item.responses)) {
        doc.font('Helvetica')
           .fontSize(9);
        const responseStr = item.responses.map((r, i) => `Day ${i + 1}: ${r || 'N/A'}`).join(' | ');
        doc.text(`   ${responseStr}`, 72, y, { width: 468 });
        y += 15;
      }
      y += 5;
    });
    y += 10;
  }

  // Daily Inspection Times
  if (form.dailyInspectionTimes && form.dailyInspectionTimes.length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Daily Inspection Times', y);
    doc.fillColor('#000000');

    form.dailyInspectionTimes.forEach((time, index) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      y = addField(doc, `Day ${index + 1}: `, time || 'N/A', y);
    });
    y += 10;
  }

  // Weather Conditions
  if (form.weatherConditions && form.weatherConditions.length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Weather Conditions', y);
    doc.fillColor('#000000');

    form.weatherConditions.forEach((weather, index) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      y = addField(doc, `Day ${index + 1}: `, weather || 'N/A', y);
    });
    y += 10;
  }

  // Action Comments
  if (y > 680) {
    doc.addPage();
    y = 50;
  }
  y = addSectionHeader(doc, 'Action Comments', y);
  doc.fillColor('#000000');
  y = addTextArea(doc, 'Comments:', form.actionComment, y);

  y += 10;

  // Inspectors
  if (form.inspectors && form.inspectors.length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    y = addSectionHeader(doc, 'Inspectors', y);
    doc.fillColor('#000000');

    form.inspectors.forEach((inspector, index) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${inspector.name || 'N/A'}`, 72, y);
      y += 15;
      if (inspector.signature) {
        try {
          // Extract base64 data and decode to buffer
          const base64Data = inspector.signature.replace(/^data:image\/\w+;base64,/, '');
          const signatureBuffer = Buffer.from(base64Data, 'base64');
          doc.font('Helvetica')
             .fontSize(9)
             .text('   Signature:', 72, y);
          y += 12;
          doc.image(signatureBuffer, 100, y, { width: 150, height: 40 });
          y += 50;
        } catch (error) {
          console.error('Error rendering signature:', error);
          doc.font('Helvetica')
             .text('   [Signature on file]', 72, y);
          y += 15;
        }
      }
      y += 5;
    });
  }

  return doc;
};
