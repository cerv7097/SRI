import React from 'react';
import { FileText, Clock, Trash2 } from 'lucide-react';

const formLabels = {
  'daily-log': 'Daily Log',
  'vehicle-inspection': 'Vehicle Inspection',
  'safety-meeting': 'Safety Meeting',
  'scaffold-inspection': 'Scaffold Inspection'
};

const AllPendingFormsModal = ({
  isOpen,
  onClose,
  draftForms,
  onEditDraft,
  onDeleteDraft,
  loading
}) => {
  if (!isOpen) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getFormTypeLabel = (formType) => {
    return formLabels[formType] || formType;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-600" size={26} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">All Pending Forms</p>
              <h3 className="text-xl font-semibold text-slate-900">Drafts & Pending Forms</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            Close
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="text-center text-slate-500 py-12">Loading pending forms...</p>
          ) : draftForms.length > 0 ? (
            <div className="space-y-4">
              {draftForms.map((form) => (
                <div
                  key={form._id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-orange-300 hover:bg-orange-50/50"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                      <FileText size={26} />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-slate-900">
                        {getFormTypeLabel(form.formType)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Job: {form.job || form.jobName || form.projectName || 'Untitled'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Last saved: {formatDate(form.updatedAt)} at {formatTime(form.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onEditDraft(form.formType, form);
                        onClose();
                      }}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => onDeleteDraft(form.formType, form._id)}
                      className="rounded-xl bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100 hover:text-red-700"
                      title="Delete draft"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Clock className="text-slate-400" size={32} />
              </div>
              <p className="text-lg font-semibold text-slate-900">No Pending Forms</p>
              <p className="text-sm text-slate-500 mt-1">All your forms are completed!</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {draftForms.length} {draftForms.length === 1 ? 'Form' : 'Forms'} Pending
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllPendingFormsModal;
