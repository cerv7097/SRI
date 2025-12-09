import React, { useState, useEffect } from 'react';
import FormButtons from '../shared/FormButtons';
import { submitForm, saveDraft, updateForm } from '../../utils/Api';

const DailyLogForm = ({ onBack, initialData }) => {
  const [formData, setFormData] = useState({
    date: '',
    job: '',
    siteAddress: '',
    personInCharge: '',
    personCompletingLog: '',
    weather: '',
    backchargesTo: '',
    bcDescription: '',
    equipmentUsed: '',
    subcontractorsOnsite: '',
    dailyReport: '',
    changeOrders: ''
  });

  // Load initial data when editing a draft
  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date ? initialData.date.split('T')[0] : '',
        job: initialData.job || '',
        siteAddress: initialData.siteAddress || '',
        personInCharge: initialData.personInCharge || '',
        personCompletingLog: initialData.personCompletingLog || '',
        weather: initialData.weather || '',
        backchargesTo: initialData.backchargesTo || '',
        bcDescription: initialData.bcDescription || '',
        equipmentUsed: initialData.equipmentUsed || '',
        subcontractorsOnsite: initialData.subcontractorsOnsite || '',
        dailyReport: initialData.dailyReport || '',
        changeOrders: initialData.changeOrders || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        // Update existing draft
        result = await updateForm('daily-log', initialData._id, submissionData);
      } else {
        // Create new form
        result = await submitForm('daily-log', submissionData);
      }

      console.log('Daily Log Form submitted:', result);
      alert('Daily Log Form submitted successfully!');
      onBack();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    try {
      let result;
      if (initialData && initialData._id) {
        // Update existing draft
        result = await updateForm('daily-log', initialData._id, { ...formData, status: 'draft' });
      } else {
        // Create new draft
        result = await saveDraft('daily-log', formData);
      }

      console.log('Draft saved:', result);
      alert('Draft saved successfully!');
      onBack();
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
      
      <h1 className="text-2xl font-bold mb-6">Daily Log</h1>
      
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
            <label className="block text-sm font-semibold mb-2">Job</label>
            <input
              type="text"
              name="job"
              value={formData.job}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              placeholder="Enter job name/number"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Site Address (Optional)</label>
          <input
            type="text"
            name="siteAddress"
            value={formData.siteAddress}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2"
            placeholder="Enter site address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Person in Charge</label>
            <input
              type="text"
              name="personInCharge"
              value={formData.personInCharge}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Person Completing Log</label>
            <input
              type="text"
              name="personCompletingLog"
              value={formData.personCompletingLog}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded p-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Weather</label>
          <input
            type="text"
            name="weather"
            value={formData.weather}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2"
            placeholder="Enter weather conditions"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Backcharges to:</label>
          <input
            type="text"
            name="backchargesTo"
            value={formData.backchargesTo}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">B/C Description</label>
          <textarea
            name="bcDescription"
            value={formData.bcDescription}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Equipment Used</label>
          <textarea
            name="equipmentUsed"
            value={formData.equipmentUsed}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Subcontractors Onsite</label>
          <textarea
            name="subcontractorsOnsite"
            value={formData.subcontractorsOnsite}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Daily Report of Construction Operations</label>
          <textarea
            name="dailyReport"
            value={formData.dailyReport}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-40"
            placeholder="Describe work completed, materials used, crew activities, etc."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Work for Changes Orders (changes, weather, etc.)</label>
          <textarea
            name="changeOrders"
            value={formData.changeOrders}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded p-2 h-32"
          />
        </div>

        <FormButtons
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
        />
      </form>
    </div>
  );
};

export default DailyLogForm;