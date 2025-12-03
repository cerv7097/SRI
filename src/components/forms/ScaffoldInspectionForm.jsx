import React, { useState, useEffect } from 'react';
import SignaturePad from '../shared/SignaturePad';
import FormButtons from '../shared/FormButtons';
import { submitForm, saveDraft, updateForm } from '../../utils/Api';

const inspectionItemLabels = [
  'A completed scaffold status tag attached near the access point.',
  'Ladder, stairway, or special-design framing is installed for access.',
  'Scaffold unit is plumb & level, & resting on stable footing & a firm foundation (including base plates/mud sills).',
  'Diagonal cross bracing is in place to support legs on all frames.',
  'Guying, tying, or bracing is installed to maintain scaffold unit stability where height-to-base size exceeds a 4:1 ratio.',
  'Visual inspection is completed for the presence of loose, damaged, or missing components (such as locking pins, planking access, framing, or bracing).',
  'Working level platform(s) is fully planked between guardrails & secured to prevent movement.',
  'Platform is free of debris & slipping/tripping hazards.',
  'Platform guardrails are firmly in place on all open sides/ends, where required.',
  'Falling object protection is provided by installed toe boards, screening at the working platform level(s), area barricades, or canopies.',
  'Fall protection documentation is reviewed, where required. Other safety hazards are controlled (such as pinch points, hot surfaces, or electrical).',
  'Each walking working surface is at least 18" wide.',
  'Gravity pins are in place.',
  'Base plates are attached to their mud sills.',
  'Mud sills are prevented from displacement.',
  'OSHA certified planks are in use.',
  'Proof of a "Competent Person" certification is available for review.'
];

const ScaffoldInspectionForm = ({ onBack, initialData }) => {
  const [formData, setFormData] = useState({
    inspector: '',
    jobName: '',
    siteAddress: '',
    siteRep: '',
    generalContractor: '',
    gcPhone: '',
    dateFrom: '',
    dateTo: '',
    inspectionItems: inspectionItemLabels.map(() => Array(7).fill(null)),
    inspectionTimes: Array(7).fill(''),
    inspectionWeather: Array(7).fill(null).map(() => ({
      Sunny: false,
      Cloudy: false,
      Windy: false,
      snowInches: '0',
      rainInches: '0'
    })),
    actionComment: '',
    inspectors: [{ name: '', signature: null, showSignaturePad: true }]
  });

  const daysOfWeek = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

  // Load initial data when editing a draft
  useEffect(() => {
    if (initialData) {
      const loadedData = {
        inspector: initialData.inspector || '',
        jobName: initialData.jobName || initialData.projectName || '',
        siteAddress: initialData.siteAddress || '',
        siteRep: initialData.siteRep || '',
        generalContractor: initialData.generalContractor || '',
        gcPhone: initialData.gcPhone || '',
        dateFrom: initialData.dateFrom ? initialData.dateFrom.split('T')[0] : '',
        dateTo: initialData.dateTo ? initialData.dateTo.split('T')[0] : '',
        inspectionItems: initialData.inspectionItems || inspectionItemLabels.map(() => Array(7).fill(null)),
        inspectionTimes: initialData.inspectionTimes || Array(7).fill(''),
        inspectionWeather: initialData.inspectionWeather || Array(7).fill(null).map(() => ({
          Sunny: false,
          Cloudy: false,
          Windy: false,
          snowInches: '0',
          rainInches: '0'
        })),
        actionComment: initialData.actionComment || '',
        inspectors: initialData.inspectors && initialData.inspectors.length > 0
          ? initialData.inspectors.map(insp => ({ ...insp, showSignaturePad: false }))
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

  const handleInspectionChange = (itemIndex, dayIndex, value) => {
    setFormData(prev => ({
      ...prev,
      inspectionItems: inspectionItemLabels.map((_, idx) => {
        const responses = prev.inspectionItems[idx] ?? Array(7).fill(null);
        if (idx !== itemIndex) return responses;
        return responses.map((response, dayIdx) => (dayIdx === dayIndex ? value : response));
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        projectName: formData.jobName, // Map jobName to projectName for backend
        status: 'completed'
      };
      let result;
      if (initialData && initialData._id) {
        result = await updateForm('scaffold-inspection', initialData._id, submissionData);
        console.log('Scaffold Inspection Form updated:', result);
        alert('Scaffold Inspection Form updated successfully!');
      } else {
        result = await submitForm('scaffold-inspection', submissionData);
        console.log('Scaffold Inspection Form submitted:', result);
        alert('Scaffold Inspection Form submitted successfully!');
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
        projectName: formData.jobName, // Map jobName to projectName for backend
        status: 'draft'
      };
      let result;
      if (initialData && initialData._id) {
        result = await updateForm('scaffold-inspection', initialData._id, draftData);
        console.log('Draft updated:', result);
        alert('Draft updated successfully!');
      } else {
        result = await saveDraft('scaffold-inspection', draftData);
        console.log('Draft saved:', result);
        alert('Draft saved successfully!');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  const handleTimeChange = (dayIndex, value) => {
    setFormData(prev => ({
      ...prev,
      inspectionTimes: prev.inspectionTimes.map((time, idx) => (idx === dayIndex ? value : time))
    }));
  };

  const handleWeatherToggle = (dayIndex, condition) => {
    setFormData(prev => ({
      ...prev,
      inspectionWeather: prev.inspectionWeather.map((weather, idx) => {
        if (idx !== dayIndex) return weather;
        return {
          ...weather,
          [condition]: !weather[condition]
        };
      })
    }));
  };

  const handleWeatherInputChange = (dayIndex, field, value) => {
    if (!['snowInches', 'rainInches'].includes(field)) return;
    setFormData(prev => ({
      ...prev,
      inspectionWeather: prev.inspectionWeather.map((weather, idx) => {
        if (idx !== dayIndex) return weather;
        return {
          ...weather,
          [field]: value
        };
      })
    }));
  };

  const normalizedInspectionItems = inspectionItemLabels.map((_, idx) => formData.inspectionItems[idx] ?? Array(7).fill(null));

  const addInspector = () => {
    setFormData(prev => ({
      ...prev,
      inspectors: [...prev.inspectors, { name: '', signature: null, showSignaturePad: true }]
    }));
  };

  const updateInspectorName = (index, value) => {
    const inspectors = [...formData.inspectors];
    inspectors[index] = { ...inspectors[index], name: value };
    setFormData(prev => ({
      ...prev,
      inspectors
    }));
  };

  const removeInspector = (index) => {
    setFormData(prev => ({
      ...prev,
      inspectors: prev.inspectors.filter((_, i) => i !== index)
    }));
  };

  const updateInspectorSignature = (index, signature) => {
    const inspectors = [...formData.inspectors];
    inspectors[index] = { ...inspectors[index], signature, showSignaturePad: false };
    setFormData(prev => ({
      ...prev,
      inspectors
    }));
  };

  const toggleInspectorSignaturePad = (index, shouldShow) => {
    const inspectors = [...formData.inspectors];
    inspectors[index] = { ...inspectors[index], showSignaturePad: shouldShow };
    setFormData(prev => ({
      ...prev,
      inspectors
    }));
  };

  const handleSelectAllYForDay = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      inspectionItems: inspectionItemLabels.map((_, itemIndex) => {
        const currentResponses = prev.inspectionItems[itemIndex] ?? Array(7).fill(null);
        const newResponses = [...currentResponses];
        newResponses[dayIndex] = true;
        return newResponses;
      })
    }));
  };

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Dashboard
      </button>
      
      <h1 className="text-2xl font-bold mb-6">Scaffold Inspection Form</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Inspector</label>
            <input
              type="text"
              name="inspector"
              value={formData.inspector}
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
              value={formData.projectName}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Site Address</label>
            <input
              type="text"
              name="siteAddress"
              value={formData.siteAddress}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Site Rep</label>
            <input
              type="text"
              name="siteRep"
              value={formData.siteRep}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">G/C</label>
            <input
              type="text"
              name="generalContractor"
              value={formData.generalContractor}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              placeholder="General Contractor"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              name="gcPhone"
              value={formData.gcPhone}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Date Range</label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              name="dateFrom"
              value={formData.dateFrom}
              onChange={handleInputChange}
              className="flex-1 border-2 border-gray-300 rounded p-2"
              required
            />
            <span>to</span>
            <input
              type="date"
              name="dateTo"
              value={formData.dateTo}
              onChange={handleInputChange}
              className="flex-1 border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-gray-300 rounded p-4 overflow-x-auto">
          <div className="flex gap-2 text-xs font-semibold min-w-max">
            <div className="w-64" />
            {daysOfWeek.map(day => (
              <div key={day} className="w-24 text-center">{day}</div>
            ))}
          </div>

          <div className="flex gap-2 mb-2 text-xs font-semibold min-w-max">
            <div className="w-64" />
            {daysOfWeek.map((day, dayIndex) => (
              <div key={`select-${day}`} className="w-24 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleSelectAllYForDay(dayIndex)}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
                >
                  Mark All Y
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4 text-xs font-semibold min-w-max">
            <div className="w-64 text-sm py-2">Inspection Time</div>
            {daysOfWeek.map((day, dayIndex) => (
              <div key={`time-${day}`} className="w-24">
                <input
                  type="time"
                  value={formData.inspectionTimes[dayIndex]}
                  onChange={(e) => handleTimeChange(dayIndex, e.target.value)}
                  className="w-full rounded border border-gray-300 p-1 text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4 text-xs font-semibold min-w-max">
            <div className="w-64 text-sm py-2">Weather Conditions</div>
            {daysOfWeek.map((day, dayIndex) => (
              <div key={`weather-${day}`} className="w-24 flex flex-col gap-1">
                {['Sunny', 'Cloudy', 'Windy'].map((condition) => (
                  <button
                    key={`${day}-${condition}`}
                    type="button"
                    className={`rounded border px-2 py-1 text-[10px] transition ${
                      formData.inspectionWeather[dayIndex]?.[condition]
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400'
                    }`}
                    onClick={() => handleWeatherToggle(dayIndex, condition)}
                  >
                    {condition}
                  </button>
                ))}
                <div className="mt-2 space-y-1">
                  <label className="flex items-center justify-between text-[10px] text-gray-600">
                    <span>Snow (in)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.inspectionWeather[dayIndex]?.snowInches || '0'}
                      onChange={(e) => handleWeatherInputChange(dayIndex, 'snowInches', e.target.value)}
                      className="ml-2 w-16 rounded border border-gray-300 p-1 text-[10px]"
                    />
                  </label>
                  <label className="flex items-center justify-between text-[10px] text-gray-600">
                    <span>Rain (in)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.inspectionWeather[dayIndex]?.rainInches || '0'}
                      onChange={(e) => handleWeatherInputChange(dayIndex, 'rainInches', e.target.value)}
                      className="ml-2 w-16 rounded border border-gray-300 p-1 text-[10px]"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {inspectionItemLabels.map((label, itemIndex) => (
              <div key={itemIndex} className="flex gap-2 items-start min-w-max">
                <div className="w-64 text-sm py-2">{label}</div>
                {daysOfWeek.map((day, dayIndex) => (
                  <div key={`${itemIndex}-${dayIndex}`} className="w-24 flex justify-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`item-${itemIndex}-day-${dayIndex}`}
                        checked={normalizedInspectionItems[itemIndex][dayIndex] === true}
                        onChange={() => handleInspectionChange(itemIndex, dayIndex, true)}
                        className="w-4 h-4"
                      />
                      <span className="ml-1 text-xs">Y</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`item-${itemIndex}-day-${dayIndex}`}
                        checked={normalizedInspectionItems[itemIndex][dayIndex] === false}
                        onChange={() => handleInspectionChange(itemIndex, dayIndex, false)}
                        className="w-4 h-4"
                      />
                      <span className="ml-1 text-xs">N</span>
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Action/Comment</label>
          <textarea
            name="actionComment"
            value={formData.actionComment}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-24"
            placeholder="Enter any issues found and corrective actions taken"
          />
        </div>

        <div className="border-t-2 border-gray-200 pt-4">
          <div className="bg-gray-50 border-2 border-gray-300 rounded p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">Inspector Signatures</h3>
                <p className="text-sm text-gray-500">Capture each inspector&apos;s printed name and signature.</p>
              </div>
              <button
                type="button"
                onClick={addInspector}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                + Add Inspector
              </button>
            </div>

            <div className="space-y-4">
              {formData.inspectors.map((inspector, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-4 space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <input
                      type="text"
                      value={inspector.name}
                      onChange={(e) => updateInspectorName(index, e.target.value)}
                      placeholder="Inspector Name"
                      className="flex-1 border border-gray-300 rounded p-2"
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Saved Signature</span>
                      <div className="w-40 h-20 border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 overflow-hidden">
                        {inspector.signature ? (
                          <img
                            src={inspector.signature}
                            alt={`Signature for ${inspector.name || `Inspector ${index + 1}`}`}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 text-center px-2">No signature saved</span>
                        )}
                      </div>
                      {!inspector.showSignaturePad && (
                        <button
                          type="button"
                          onClick={() => toggleInspectorSignaturePad(index, true)}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {inspector.signature ? 'Update Signature' : 'Add Signature'}
                        </button>
                      )}
                    </div>
                    {formData.inspectors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInspector(index)}
                        className="text-red-600 hover:text-red-800 md:self-start"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {inspector.showSignaturePad && (
                    <SignaturePad
                      onSave={(signature) => updateInspectorSignature(index, signature)}
                      label={`Signature for ${inspector.name || `Inspector ${index + 1}`}`}
                    />
                  )}
                </div>
              ))}
            </div>
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

export default ScaffoldInspectionForm;
