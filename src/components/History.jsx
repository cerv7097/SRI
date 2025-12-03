import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Search, FileText, Clock } from 'lucide-react';
import { getFormHistory, getFormById, exportFormToPDF } from '../utils/Api';
import CompletedFormModal from './forms/CompletedFormModal';

const History = () => {
  const [allForms, setAllForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormType, setSelectedFormType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const [isViewingForm, setIsViewingForm] = useState(false);
  const [selectedFormMeta, setSelectedFormMeta] = useState(null);
  const [selectedFormData, setSelectedFormData] = useState(null);
  const [viewingFormError, setViewingFormError] = useState(null);
  const [viewingFormLoading, setViewingFormLoading] = useState(false);

  useEffect(() => {
    fetchAllForms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allForms, searchTerm, selectedFormType, selectedStatus, dateRange]);

  const fetchAllForms = async () => {
    try {
      setLoading(true);
      const formTypes = ['daily-log', 'vehicle-inspection', 'safety-meeting', 'scaffold-inspection'];

      const allFormsData = await Promise.all(
        formTypes.map(async (formType) => {
          try {
            const response = await getFormHistory(formType, 100);
            return response.data.map(form => ({
              ...form,
              formType
            }));
          } catch (error) {
            console.error(`Error fetching ${formType}:`, error);
            return [];
          }
        })
      );

      const flatForms = allFormsData.flat();
      const sortedForms = flatForms.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setAllForms(sortedForms);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allForms];

    if (selectedFormType !== 'all') {
      filtered = filtered.filter(form => form.formType === selectedFormType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(form => form.status === selectedStatus);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      if (dateRange !== 'all') {
        filtered = filtered.filter(form => new Date(form.updatedAt) >= filterDate);
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(form => {
        const jobName = (form.job || form.jobName || form.projectName || '').toLowerCase();
        const operator = (form.operatorName || form.personCompletingLog || form.inspector || '').toLowerCase();
        const formTypeLabel = getFormTypeLabel(form.formType).toLowerCase();

        return jobName.includes(term) || operator.includes(term) || formTypeLabel.includes(term);
      });
    }

    setFilteredForms(filtered);
  };

  const getFormTypeLabel = (formType) => {
    const labels = {
      'daily-log': 'Daily Log',
      'vehicle-inspection': 'Vehicle Inspection',
      'safety-meeting': 'Safety Meeting',
      'scaffold-inspection': 'Scaffold Inspection'
    };
    return labels[formType] || formType;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleViewForm = async (form) => {
    setSelectedFormMeta(form);
    setSelectedFormData(null);
    setViewingFormError(null);
    setIsViewingForm(true);
    setViewingFormLoading(true);

    try {
      const response = await getFormById(form.formType, form._id);
      setSelectedFormData({ ...response.data, formType: form.formType });
    } catch (error) {
      console.error('Error fetching form details:', error);
      setViewingFormError('Unable to load form details. Please try again.');
    } finally {
      setViewingFormLoading(false);
    }
  };

  const handleExportForm = async (formType, formId) => {
    try {
      await exportFormToPDF(formType, formId);
    } catch (error) {
      console.error('Error exporting form:', error);
      alert('Failed to export form. Please try again.');
    }
  };

  const closeViewModal = () => {
    setIsViewingForm(false);
    setSelectedFormMeta(null);
    setSelectedFormData(null);
    setViewingFormError(null);
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">Completed</span>;
    }
    return <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">Draft</span>;
  };

  return (
    <div className="py-10 space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Form Records</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">History</h1>
          <p className="mt-2 text-slate-500">Browse and search all form submissions with advanced filtering.</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by job, operator, or form type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedFormType}
              onChange={(e) => setSelectedFormType(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Form Types</option>
              <option value="daily-log">Daily Log</option>
              <option value="vehicle-inspection">Vehicle Inspection</option>
              <option value="safety-meeting">Safety Meeting</option>
              <option value="scaffold-inspection">Scaffold Inspection</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredForms.length}</span> of <span className="font-semibold text-slate-900">{allForms.length}</span> total forms
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="px-6 py-16 text-center text-slate-500">
              <Clock className="mx-auto mb-3 animate-spin text-slate-400" size={32} />
              <p>Loading form history...</p>
            </div>
          ) : filteredForms.length > 0 ? (
            filteredForms.map((form) => (
              <div key={form._id} className="px-6 py-5 hover:bg-slate-50 transition">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">{getFormTypeLabel(form.formType)}</h3>
                      {getStatusBadge(form.status)}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Job:</span> {form.job || form.jobName || form.projectName || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">By:</span> {form.operatorName || form.personCompletingLog || form.inspector || 'N/A'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(form.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(form.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewForm(form)}
                      className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      View
                    </button>
                    {form.status === 'completed' && (
                      <button
                        onClick={() => handleExportForm(form.formType, form._id)}
                        className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Export
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center text-slate-500">
              <Filter className="mx-auto mb-3 text-slate-300" size={48} />
              <p className="text-lg font-medium text-slate-700">No forms found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </section>

      <CompletedFormModal
        isOpen={isViewingForm}
        onClose={closeViewModal}
        formType={selectedFormMeta?.formType}
        formData={selectedFormData}
        loading={viewingFormLoading}
        error={viewingFormError}
        onExport={() => {
          if (selectedFormMeta) {
            handleExportForm(selectedFormMeta.formType, selectedFormMeta._id);
          }
        }}
      />
    </div>
  );
};

export default History;
