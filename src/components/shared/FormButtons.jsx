import React from 'react';

const FormButtons = ({ onSubmit, onSaveDraft, onCancel }) => {
  return (
    <div className="flex gap-4">
      <button
        type="submit"
        onClick={onSubmit}
        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Submit Form
      </button>
      <button
        type="button"
        onClick={onSaveDraft}
        className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
      >
        Save as Draft
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 bg-red-100 text-red-700 py-3 rounded-lg font-semibold hover:bg-red-200"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default FormButtons;