import React, { useState, useEffect } from 'react';
import SignaturePad from '../shared/SignaturePad';
import FormButtons from '../shared/FormButtons';
import { submitForm, saveDraft, updateForm } from '../../utils/Api';

const SafetyMeetingForm = ({ onBack, initialData }) => {
  const [formData, setFormData] = useState({
    date: '',
    jobName: '',
    topic: '',
    recommendations: '',
    attendees: [{ name: '', signature: null, showSignaturePad: true }]
  });

  // Load initial data when editing a draft
  useEffect(() => {
    if (initialData) {
      const loadedData = {
        date: initialData.date ? initialData.date.split('T')[0] : '',
        jobName: initialData.jobName || '',
        topic: initialData.topic || '',
        recommendations: initialData.recommendations || '',
        attendees: initialData.attendees && initialData.attendees.length > 0
          ? initialData.attendees.map(att => ({ ...att, showSignaturePad: false }))
          : [{ name: '', signature: null, showSignaturePad: true }]
      };
      setFormData(loadedData);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addAttendee = () => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { name: '', signature: null, showSignaturePad: true }]
    }));
  };

  const updateAttendee = (index, value) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      name: value
    };
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const removeAttendee = (index) => {
    const newAttendees = formData.attendees.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const updateAttendeeSignature = (index, signature) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      signature,
      showSignaturePad: false
    };
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const toggleSignaturePadVisibility = (index, shouldShow) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      showSignaturePad: shouldShow
    };
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        status: 'completed'
      };
      let result;
      if (initialData && initialData._id) {
        result = await updateForm('safety-meeting', initialData._id, submissionData);
        console.log('Safety Meeting Form updated:', result);
        alert('Safety Meeting Form updated successfully!');
      } else {
        result = await submitForm('safety-meeting', submissionData);
        console.log('Safety Meeting Form submitted:', result);
        alert('Safety Meeting Form submitted successfully!');
      }
      onBack();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    try {
      const draftData = {
        ...formData,
        status: 'draft'
      };
      let result;
      if (initialData && initialData._id) {
        result = await updateForm('safety-meeting', initialData._id, draftData);
        console.log('Draft updated:', result);
        alert('Draft updated successfully!');
      } else {
        result = await saveDraft('safety-meeting', formData);
        console.log('Draft saved:', result);
        alert('Draft saved successfully!');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Dashboard
      </button>
      
      <h1 className="text-2xl font-bold mb-6">Weekly Safety Meeting Form</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Job Name</label>
            <input
              type="text"
              name="jobName"
              value={formData.jobName}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              placeholder="Enter job name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Topic</label>
          <textarea
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-32"
            placeholder="Enter meeting topic and discussion points"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Employee Recommendations</label>
          <textarea
            name="recommendations"
            value={formData.recommendations}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-24"
            placeholder="Enter employee recommendations"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-4">Meeting Attended By</label>
          <div className="border-2 border-gray-300 rounded p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Attendees</span>
              <button
                type="button"
                onClick={addAttendee}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                + Add Attendee
              </button>
            </div>
            <div className="space-y-4">
              {formData.attendees.map((attendee, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-4 space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <input
                      type="text"
                      value={attendee.name}
                      onChange={(e) => updateAttendee(index, e.target.value)}
                      placeholder="Print Name"
                      className="flex-1 border border-gray-300 rounded p-2"
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Saved Signature</span>
                      <div className="w-40 h-20 border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 overflow-hidden">
                        {attendee.signature ? (
                          <img
                            src={attendee.signature}
                            alt={`Signature for ${attendee.name || `Attendee ${index + 1}`}`}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 text-center px-2">No signature saved</span>
                        )}
                      </div>
                      {!attendee.showSignaturePad && (
                        <button
                          type="button"
                          onClick={() => toggleSignaturePadVisibility(index, true)}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {attendee.signature ? 'Update Signature' : 'Add Signature'}
                        </button>
                      )}
                    </div>
                    {formData.attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(index)}
                        className="text-red-600 hover:text-red-800 md:self-start"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {attendee.showSignaturePad && (
                    <SignaturePad
                      onSave={(signature) => updateAttendeeSignature(index, signature)}
                      label={`Signature for ${attendee.name || `Attendee ${index + 1}`}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-6">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded p-4">
            <p className="text-sm">
              <strong>Acknowledgment:</strong> By signing your name at this safety meeting you have acknowledged that you are
              complying with the rules and regulation set forth by Stucco Rite, Inc. on all jobs safety rules, no use of tobacco
              products where prohibited, and the use of <strong>Alcohol</strong> or <strong>Illegal Drugs</strong> on job site will be cause for immediate dismissal.
              Any injury <strong>MUST</strong> be reported to your supervisor immediately.
            </p>
          </div>
        </div>

        <FormButtons
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
        />
      </form>
    </div>
  );
};

export default SafetyMeetingForm;
