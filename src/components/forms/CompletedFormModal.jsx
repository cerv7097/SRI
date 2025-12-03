import React from 'react';

const formLabels = {
  'daily-log': 'Daily Log',
  'vehicle-inspection': 'Vehicle Inspection',
  'safety-meeting': 'Safety Meeting',
  'scaffold-inspection': 'Scaffold Inspection'
};

const CompletedFormModal = ({
  isOpen,
  onClose,
  formType,
  formData,
  loading,
  error,
  onExport
}) => {
  if (!isOpen) {
    return null;
  }

  const title = formLabels[formType] || 'Form Details';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Completed Form</p>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            Close
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {loading && (
            <p className="text-center text-slate-500">Loading form details...</p>
          )}

          {!loading && error && (
            <p className="text-center text-red-600">{error}</p>
          )}

          {!loading && !error && formData && (
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">
              {JSON.stringify(formData, null, 2)}
            </pre>
          )}

          {!loading && !error && !formData && (
            <p className="text-center text-slate-500">No data available for this form.</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Actions</div>
          <div className="flex gap-3">
            <button
              onClick={onExport}
              disabled={loading || !!error}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedFormModal;
