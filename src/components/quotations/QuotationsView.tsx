import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  FileDown,
  ChevronRight,
  DollarSign,
  Building,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { Project } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { StatusBadge } from '../common/StatusBadge';
import { generateQuotationDocx } from '../../utils/docxGenerator';

interface QuotationsViewProps {
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  onSelectProject,
  onNewProject,
}) => {
  const { language, projects, settings, approveProject } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');

  // Quotation projects are either draft, quotation_ready, or waiting_approval (or all projects with quotations)
  const quotationProjects = projects.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client?.name && p.client.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.quotationsTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.quotationsSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg transition-all shadow-md shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          {t.newQuotation}
        </button>
      </div>

      {/* Quotations List Card (High-Density rounded-2xl Container) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchProjects}
              className="w-full rounded-lg bg-gray-100 border-transparent py-1.5 ps-8 pe-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono bg-gray-100 px-2.5 py-1 rounded-full">
            {quotationProjects.length} {isRtl ? 'عرض سعر' : 'quotations'}
          </span>
        </div>

        {quotationProjects.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600">{t.noProjectsFound}</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-start border-collapse">
              <thead className="bg-gray-50 text-slate-500 text-xs uppercase sticky top-0 z-10 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.colProjectNumber}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.colProjectName}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.colClient}</th>
                  <th className="px-5 py-3.5 font-semibold text-end">{t.colValue}</th>
                  <th className="px-5 py-3.5 font-semibold text-center">{t.colStatus}</th>
                  <th className="px-5 py-3.5 font-semibold text-end">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {quotationProjects.map((project) => {
                  const total = getProjectTotal(project);
                  const pCurrency = project.currency || currency;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => onSelectProject(project.id)}
                    >
                      <td className="px-5 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {project.projectNumber}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {project.client?.name || '-'} {project.client?.company ? `(${project.client.company})` : ''}
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
                          {/* One click word docx download */}
                          <button
                            type="button"
                            onClick={() => generateQuotationDocx(project, settings, language)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
                          >
                            <FileDown className="w-3.5 h-3.5 text-blue-600" />
                            {isRtl ? 'تحميل Word' : 'Download DOCX'}
                          </button>

                          {(project.status === 'draft' || project.status === 'quotation_ready' || project.status === 'waiting_approval') && (
                            <button
                              type="button"
                              onClick={() => approveProject(project.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-200"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t.approveProject}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
