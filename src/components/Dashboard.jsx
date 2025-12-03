import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clipboard,
  Truck,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { getFormHistory, getFormById, exportFormToPDF, getJobSites } from '../utils/Api';
import CompletedFormModal from './forms/CompletedFormModal';
import JobSitesMapModal from './JobSitesMapModal';

const Dashboard = ({ onNavigate, onEditDraft }) => {
  const [draftForms, setDraftForms] = useState([]);
  const [completedForms, setCompletedForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobSites, setJobSites] = useState([]);
  const [jobSitesLoading, setJobSitesLoading] = useState(true);
  const [isViewingForm, setIsViewingForm] = useState(false);
  const [selectedFormMeta, setSelectedFormMeta] = useState(null);
  const [selectedFormData, setSelectedFormData] = useState(null);
  const [viewingFormError, setViewingFormError] = useState(null);
  const [viewingFormLoading, setViewingFormLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    fetchForms();
    fetchJobSiteData();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const formTypes = ['daily-log', 'vehicle-inspection', 'safety-meeting', 'scaffold-inspection'];

      const allForms = await Promise.all(
        formTypes.map(async (formType) => {
          try {
            const response = await getFormHistory(formType, 50);
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

      const flatForms = allForms.flat();
      const drafts = flatForms.filter(form => form.status === 'draft');
      const completed = flatForms.filter(form => form.status === 'completed');

      setDraftForms(drafts);
      setCompletedForms(completed);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobSiteData = async () => {
    try {
      setJobSitesLoading(true);
      const response = await getJobSites(20);
      setJobSites(response.data || []);
    } catch (error) {
      console.error('Error fetching job sites:', error);
    } finally {
      setJobSitesLoading(false);
    }
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

  const openMapModal = () => {
    if (!jobSites.length) {
      alert('No job site addresses captured yet. Submit a form with an address to view it on the map.');
      return;
    }
    setIsMapOpen(true);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const stats = [
    {
      label: 'Pending Forms',
      value: draftForms.length,
      subtext: 'Awaiting completion',
      icon: Clock,
      accent: 'text-orange-600',
      chip: 'bg-orange-100',
    },
    {
      label: 'Active Job Sites',
      value: jobSites.length,
      subtext: 'Crew on site today',
      icon: MapPin,
      accent: 'text-green-600',
      chip: 'bg-green-100',
    },
    {
      label: 'Completed This Week',
      value: completedForms.length,
      subtext: 'Submitted & archived',
      icon: CheckCircle,
      accent: 'text-blue-600',
      chip: 'bg-blue-100',
    },
    {
      label: 'Safety Meetings',
      value: 3,
      subtext: 'Scheduled this week',
      icon: Clipboard,
      accent: 'text-purple-600',
      chip: 'bg-purple-100',
    },
  ];

  const formOptions = [
    {
      id: 'safetyMeeting',
      title: 'Weekly Safety Meeting',
      description: 'Document safety topics and attendees',
      icon: Clipboard,
    },
    {
      id: 'vehicleInspection',
      title: 'Vehicle Inspection',
      description: 'Pre-use vehicle and equipment checks',
      icon: Truck,
    },
    {
      id: 'dailyLog',
      title: 'Daily Log',
      description: 'Record daily construction operations',
      icon: Calendar,
    },
    {
      id: 'scaffoldInspection',
      title: 'Scaffold Inspection',
      description: 'Daily scaffold safety checklist',
      icon: FileText,
    },
  ];

  return (
    <div className="py-10 space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Operations Overview</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-500">Stay on top of pending forms, current job sites, and recent submissions.</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, subtext, icon: Icon, accent, chip }) => (
          <article key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{subtext}</p>
              </div>
              <div className={`rounded-2xl p-3 ${chip}`}>
                <Icon className={`${accent}`} size={24} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <article className="xl:col-span-7 rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Create New Form</h2>
            <p className="text-sm text-slate-500">Start a new submission in seconds.</p>
          </div>
          <div className="space-y-4 px-6 py-5">
            {formOptions.map(({ id, title, description, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-blue-400 hover:bg-blue-50/40"
              >
                <span className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Icon size={22} />
                </span>
                <span>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="text-sm text-slate-500">{description}</p>
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="xl:col-span-5 rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <Clock className="text-orange-600" size={26} />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Drafts & Pending Forms</h2>
                <p className="text-sm text-slate-500">Pick up where you left off.</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-500">View All</button>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500">Loading drafts...</div>
          ) : draftForms.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {draftForms.map((form) => (
                <div key={form._id} className="flex flex-wrap items-center gap-4 px-6 py-5">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                      <FileText size={26} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{getFormTypeLabel(form.formType)}</p>
                      <p className="text-sm text-slate-500">
                        {form.job || form.jobName || form.projectName || 'Untitled'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Last saved: {formatDate(form.updatedAt)} at {formatTime(form.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onEditDraft(form.formType, form)}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Continue
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-slate-500">No pending forms</div>
          )}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <article className="xl:col-span-8 rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-blue-600" size={26} />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Completed Forms</h2>
                <p className="text-sm text-slate-500">Recent submissions ready for export.</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-500">Export All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] divide-y divide-slate-100 text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Form</th>
                  <th className="px-6 py-3">Job</th>
                  <th className="px-6 py-3">Completed By</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : completedForms.length > 0 ? (
                  completedForms.map((form) => (
                    <tr key={form._id} className="text-sm">
                      <td className="px-6 py-4 font-semibold text-slate-900">{getFormTypeLabel(form.formType)}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {form.job || form.jobName || form.projectName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {form.completedByName ? form.completedByName.split(' ')[0] : (form.operatorName || form.personCompletingLog || form.inspector || 'N/A')}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(form.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleViewForm(form)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleExportForm(form.formType, form._id)}
                            className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                          >
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No completed forms</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="xl:col-span-4 rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-green-600" size={26} />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Current Job Sites</h2>
                <p className="text-sm text-slate-500">Live progress at each location.</p>
              </div>
            </div>
            <button
              onClick={openMapModal}
              className="text-sm font-semibold text-blue-600 hover:text-blue-500"
            >
              View Map
            </button>
          </div>
          {jobSitesLoading ? (
            <div className="px-6 py-12 text-center text-slate-500">Loading job sites...</div>
          ) : jobSites.length ? (
            <div className="divide-y divide-slate-100">
              {jobSites.map((site, index) => (
                <div key={`${site.jobName}-${site.address}-${index}`} className="px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{site.jobName}</p>
                      <p className="text-sm text-slate-500">{site.address}</p>
                      <p className="text-xs text-slate-400">Updated: {formatDate(site.updatedAt)}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                      {site.status === 'completed' ? 'Completed' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-slate-500">
              No job site addresses recorded yet.
            </div>
          )}
        </article>
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

      <JobSitesMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        jobSites={jobSites}
      />
    </div>
  );
};

export default Dashboard;
