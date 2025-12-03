import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, TrendingUp, Download, Calendar, MapPin, Users, AlertTriangle } from 'lucide-react';
import { getFormHistory, getJobSites } from '../utils/Api';

const Reports = () => {
  const [allForms, setAllForms] = useState([]);
  const [jobSites, setJobSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const formTypes = ['daily-log', 'vehicle-inspection', 'safety-meeting', 'scaffold-inspection'];

      const [formsData, jobSitesData] = await Promise.all([
        Promise.all(
          formTypes.map(async (formType) => {
            try {
              const response = await getFormHistory(formType, 100);
              return response.data.map(form => ({ ...form, formType }));
            } catch (error) {
              console.error(`Error fetching ${formType}:`, error);
              return [];
            }
          })
        ),
        getJobSites(50).catch(() => ({ data: [] }))
      ]);

      setAllForms(formsData.flat());
      setJobSites(jobSitesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredForms = () => {
    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return allForms;
    }

    return allForms.filter(form => new Date(form.createdAt) >= filterDate);
  };

  const filteredForms = getFilteredForms();
  const completedForms = filteredForms.filter(form => form.status === 'completed');
  const draftForms = filteredForms.filter(form => form.status === 'draft');

  const formTypeCounts = {
    'daily-log': filteredForms.filter(f => f.formType === 'daily-log' && f.status === 'completed').length,
    'vehicle-inspection': filteredForms.filter(f => f.formType === 'vehicle-inspection' && f.status === 'completed').length,
    'safety-meeting': filteredForms.filter(f => f.formType === 'safety-meeting' && f.status === 'completed').length,
    'scaffold-inspection': filteredForms.filter(f => f.formType === 'scaffold-inspection' && f.status === 'completed').length,
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

  const getJobSiteStats = () => {
    const jobMap = new Map();

    completedForms.forEach(form => {
      const jobName = form.job || form.jobName || form.projectName;
      if (jobName) {
        if (!jobMap.has(jobName)) {
          jobMap.set(jobName, 0);
        }
        jobMap.set(jobName, jobMap.get(jobName) + 1);
      }
    });

    return Array.from(jobMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getOperatorStats = () => {
    const operatorMap = new Map();

    completedForms.forEach(form => {
      const operator = form.operatorName || form.personCompletingLog || form.inspector;
      if (operator) {
        if (!operatorMap.has(operator)) {
          operatorMap.set(operator, 0);
        }
        operatorMap.set(operator, operatorMap.get(operator) + 1);
      }
    });

    return Array.from(operatorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getCompletionRate = () => {
    const total = filteredForms.length;
    if (total === 0) return 0;
    return Math.round((completedForms.length / total) * 100);
  };

  const getPeriodLabel = () => {
    const labels = {
      week: 'Last 7 Days',
      month: 'Last 30 Days',
      quarter: 'Last 3 Months',
      year: 'Last Year',
      all: 'All Time'
    };
    return labels[selectedPeriod] || 'Selected Period';
  };

  const topJobSites = getJobSiteStats();
  const topOperators = getOperatorStats();
  const completionRate = getCompletionRate();
  const maxFormCount = Math.max(...Object.values(formTypeCounts), 1);

  const summaryStats = [
    {
      label: 'Total Submissions',
      value: completedForms.length,
      subtext: `${draftForms.length} drafts pending`,
      icon: FileText,
      color: 'blue',
    },
    {
      label: 'Active Job Sites',
      value: jobSites.length,
      subtext: 'Tracked locations',
      icon: MapPin,
      color: 'green',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      subtext: 'Forms completed',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      label: 'Pending Review',
      value: draftForms.length,
      subtext: 'Awaiting completion',
      icon: AlertTriangle,
      color: 'orange',
    },
  ];

  return (
    <div className="py-10 space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Analytics Overview</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Reports</h1>
          <p className="mt-2 text-slate-500">View aggregated data and insights from all form submissions.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 flex items-center gap-2">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-card px-6 py-20 text-center">
          <BarChart3 className="mx-auto mb-4 animate-pulse text-slate-300" size={48} />
          <p className="text-slate-500">Loading report data...</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryStats.map(({ label, value, subtext, icon: Icon, color }) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
                green: { bg: 'bg-green-100', text: 'text-green-600' },
                purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
                orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
              };
              const colors = colorClasses[color];

              return (
                <article key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                      <p className="mt-1 text-sm text-slate-500">{subtext}</p>
                    </div>
                    <div className={`rounded-2xl p-3 ${colors.bg}`}>
                      <Icon className={colors.text} size={24} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-100 bg-white shadow-card">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-blue-600" size={26} />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Forms by Type</h2>
                    <p className="text-sm text-slate-500">{getPeriodLabel()}</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-6 space-y-5">
                {Object.entries(formTypeCounts).map(([formType, count]) => {
                  const percentage = maxFormCount > 0 ? (count / maxFormCount) * 100 : 0;
                  return (
                    <div key={formType}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">{getFormTypeLabel(formType)}</span>
                        <span className="text-sm font-bold text-slate-900">{count}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {completedForms.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No completed forms in this period</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-white shadow-card">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <MapPin className="text-green-600" size={26} />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Top Job Sites</h2>
                    <p className="text-sm text-slate-500">By form submissions</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-6">
                {topJobSites.length > 0 ? (
                  <div className="space-y-4">
                    {topJobSites.map(([jobName, count], index) => (
                      <div key={jobName} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{jobName}</p>
                          <p className="text-sm text-slate-500">{count} forms submitted</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No job site data available</p>
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-100 bg-white shadow-card">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Users className="text-purple-600" size={26} />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Top Contributors</h2>
                    <p className="text-sm text-slate-500">Most active operators</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-6">
                {topOperators.length > 0 ? (
                  <div className="space-y-4">
                    {topOperators.map(([operator, count], index) => (
                      <div key={operator} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{operator}</p>
                          <p className="text-sm text-slate-500">{count} forms completed</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No operator data available</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-white shadow-card">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-orange-600" size={26} />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
                    <p className="text-sm text-slate-500">{getPeriodLabel()}</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Total Forms</span>
                  <span className="text-lg font-bold text-slate-900">{filteredForms.length}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Completed</span>
                  <span className="text-lg font-bold text-green-600">{completedForms.length}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Drafts</span>
                  <span className="text-lg font-bold text-orange-600">{draftForms.length}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Active Job Sites</span>
                  <span className="text-lg font-bold text-blue-600">{jobSites.length}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-600">Completion Rate</span>
                  <span className="text-lg font-bold text-purple-600">{completionRate}%</span>
                </div>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default Reports;
