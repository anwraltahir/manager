import React, { useState } from 'react';
import {
  FolderKanban,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  Filter,
  FileDown,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Calendar,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { StatusBadge } from '../common/StatusBadge';
import { generateQuotationDocx, generateHandoverDocx } from '../../utils/docxGenerator';

interface DashboardViewProps {
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  initialFilter?: ProjectStatus | 'all';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectProject,
  onNewProject,
  initialFilter = 'all',
}) => {
  const { language, projects, stats, settings, approveProject, completeProject } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>(initialFilter);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client?.name && p.client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.client?.company && p.client.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getProjectTotal = (project: Project) => {
    const servicesTotal = (project.scopeItems || []).reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const setupFee = Number(project.setupFee) || 0;
    const additionalFee = Number(project.additionalFee) || 0;
    const discount = Number(project.discount) || 0;
    return servicesTotal + setupFee + additionalFee - discount;
  };

  const currency = settings.currency || 'USD';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Metric Stats Cards (High-Density 6-Column Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 shrink-0">
        {/* Total Projects */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'all'
              ? 'border-blue-600 ring-2 ring-blue-500/20'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium">{t.totalProjects}</p>
            <FolderKanban className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {stats.totalProjects}
          </h3>
        </div>

        {/* Quotations Ready */}
        <div
          onClick={() => setStatusFilter('quotation_ready')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'quotation_ready'
              ? 'border-blue-600 ring-2 ring-blue-500/20'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium">{t.activeQuotations}</p>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-blue-600">
            {stats.quotationReady}
          </h3>
        </div>

        {/* Waiting Approval */}
        <div
          onClick={() => setStatusFilter('waiting_approval')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'waiting_approval'
              ? 'border-orange-500 ring-2 ring-orange-500/20'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium">{t.waitingApproval}</p>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-orange-500">
            {String(stats.waitingApproval).padStart(2, '0')}
          </h3>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setStatusFilter('in_progress')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            isRtl ? 'border-r-4 border-r-emerald-500' : 'border-l-4 border-l-emerald-500'
          } ${
            statusFilter === 'in_progress'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium">{t.inProgress}</p>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-emerald-600">
            {String(stats.inProgress).padStart(2, '0')}
          </h3>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStatusFilter('completed')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'completed'
              ? 'border-blue-600 ring-2 ring-blue-500/20'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium">{t.completed}</p>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-400">
            {String(stats.completed).padStart(2, '0')}
          </h3>
        </div>

        {/* Total Pipeline Value (Dark Card) */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1 text-slate-300">
            <p className="text-xs text-slate-300 font-medium">{t.totalValue}</p>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white truncate">
            ${(stats.totalValue || 0).toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Main Table Card (High-Density rounded-2xl Container) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden">
        {/* Table Header / Action Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-lg text-slate-900">{isRtl ? 'المشاريع الحالية' : 'Current Projects'}</h2>
            <span className="text-xs text-slate-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredProjects.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input inside table toolbar */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchProjects}
                className="w-full rounded-lg bg-gray-100 border-transparent py-1.5 ps-8 pe-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Quick Status Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {[
                { key: 'all', label: t.filterAll },
                { key: 'quotation_ready', label: t.status_quotation_ready },
                { key: 'waiting_approval', label: t.status_waiting_approval },
                { key: 'in_progress', label: t.status_in_progress },
                { key: 'completed', label: t.status_completed },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === f.key
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'border border-gray-200 text-slate-600 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600">{t.noProjectsFound}</p>
            <button
              type="button"
              onClick={onNewProject}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-200"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.newProject}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-start border-collapse">
              <thead className="bg-gray-50 text-slate-500 text-xs uppercase sticky top-0 z-10 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.colProjectNumber}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.colProjectName}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.colClient}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.colType}</th>
                  <th className="px-5 py-3.5 font-semibold text-end">{t.colValue}</th>
                  <th className="px-5 py-3.5 font-semibold text-center">{t.colStatus}</th>
                  <th className="px-5 py-3.5 font-semibold text-end">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredProjects.map((project) => {
                  const total = getProjectTotal(project);
                  const pCurrency = project.currency || currency;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectProject(project.id)}
                    >
                      <td className="px-5 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {project.projectNumber}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        <div className="group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </div>
                        {project.expectedDeliveryDate && (
                          <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {project.expectedDeliveryDate}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        <div className="font-medium">{project.client?.name || '-'}</div>
                        {project.client?.company && (
                          <div className="text-[11px] text-slate-400">{project.client.company}</div>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                          {project.customType || project.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-end font-medium font-mono text-slate-900 whitespace-nowrap">
                        {pCurrency === 'USD' ? `$${(total || 0).toLocaleString()}` : `${(total || 0).toLocaleString()} ${pCurrency}`}
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <StatusBadge status={project.status} size="sm" />
                      </td>

                      <td
                        className="px-5 py-4 text-end whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectProject(project.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-xs inline-flex items-center gap-0.5"
                          >
                            {t.view}
                          </button>

                          {/* Quick Word Quotation Download */}
                          <button
                            type="button"
                            onClick={() => generateQuotationDocx(project, settings, language)}
                            title={t.generateQuotationDocx}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>

                          {/* Quick Word Handover Download */}
                          <button
                            type="button"
                            onClick={() => generateHandoverDocx(project, settings, language)}
                            title={t.generateHandoverDocx}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer / Pagination */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>
            {isRtl
              ? `عرض ${filteredProjects.length} من أصل ${projects.length} مشروع`
              : `Showing ${filteredProjects.length} of ${projects.length} projects`}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg bg-white text-slate-400 hover:bg-gray-100 disabled:opacity-40"
              disabled
            >
              &lt;
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center border border-blue-600 rounded-lg bg-blue-600 text-white font-bold"
            >
              1
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg bg-white text-slate-700 hover:bg-gray-100 font-semibold"
            >
              2
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg bg-white text-slate-700 hover:bg-gray-100"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
