import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  FileDown,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Building,
  DollarSign,
  Calendar,
  Layers,
  FileText,
  ShieldCheck,
  Printer,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmModal } from '../common/ConfirmModal';
import { HandoverSection } from './HandoverSection';
import { generateQuotationDocx, generateHandoverDocx } from '../../utils/docxGenerator';

interface ProjectDetailsProps {
  project: Project;
  onEdit: () => void;
  onBack: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onEdit,
  onBack,
}) => {
  const { language, settings, approveProject, completeProject, deleteProject } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'client' | 'scope' | 'phases' | 'financial' | 'documents' | 'handover'
  >(project.status === 'completed' ? 'handover' : 'overview');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Financial calculations
  const servicesTotal = (project.scopeItems || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const setupFee = Number(project.setupFee) || 0;
  const additionalFee = Number(project.additionalFee) || 0;
  const discount = Number(project.discount) || 0;
  const finalTotal = servicesTotal + setupFee + additionalFee - discount;
  const currency = project.currency || settings.currency || 'USD';

  // Workflow steps
  const steps: { key: ProjectStatus; label: string }[] = [
    { key: 'draft', label: t.stepDraft },
    { key: 'quotation_ready', label: t.stepQuotation },
    { key: 'waiting_approval', label: t.stepWaiting },
    { key: 'in_progress', label: t.stepInProgress },
    { key: 'completed', label: t.stepCompleted },
  ];

  const getStepIndex = (status: ProjectStatus) => {
    switch (status) {
      case 'draft':
        return 0;
      case 'quotation_ready':
        return 1;
      case 'waiting_approval':
        return 2;
      case 'in_progress':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(project.status);

  const handleApprove = () => {
    approveProject(project.id);
    setShowApproveModal(false);
  };

  const handleComplete = () => {
    completeProject(project.id);
    setShowCompleteModal(false);
    setActiveTab('handover');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-16 animate-in fade-in duration-150">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-gray-100 transition-colors mt-0.5"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-slate-500 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                {project.projectNumber}
              </span>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-3">
              <span>{t.colClient}: <strong className="text-slate-700">{project.client?.name || '-'}</strong> {project.client?.company ? `(${project.client.company})` : ''}</span>
              <span>•</span>
              <span>{t.colType}: <strong className="text-slate-700">{project.customType || project.type}</strong></span>
              <span>•</span>
              <span>{t.colValue}: <strong className="text-slate-900 font-mono">{currency === 'USD' ? `$${(finalTotal || 0).toLocaleString()}` : `${(finalTotal || 0).toLocaleString()} ${currency}`}</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Conditional Workflow Actions */}
          {(project.status === 'draft' || project.status === 'quotation_ready' || project.status === 'waiting_approval') && (
            <button
              type="button"
              onClick={() => setShowApproveModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.approveProject}
            </button>
          )}

          {project.status === 'in_progress' && (
            <button
              type="button"
              onClick={() => setShowCompleteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-md shadow-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.markCompleted}
            </button>
          )}

          {/* Quotation Word Download */}
          <button
            type="button"
            onClick={() => generateQuotationDocx(project, settings, language)}
            title={t.generateQuotationDocx}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            {isRtl ? 'عرض السعر (Word)' : 'Quotation (Word)'}
          </button>

          {/* Handover Word Download */}
          <button
            type="button"
            onClick={() => generateHandoverDocx(project, settings, language)}
            title={t.generateHandoverDocx}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {isRtl ? 'ملف التسليم (Word)' : 'Handover (Word)'}
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={onEdit}
            title={t.edit}
            className="p-2 text-slate-600 hover:text-blue-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            title={t.delete}
            className="p-2 text-slate-400 hover:text-rose-600 border border-gray-200 rounded-lg hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Workflow Progress Stepper */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 mb-3">{t.workflowTitle}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 bg-gray-50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-600' : 'bg-current'}`} />
                  )}
                  <span>{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border border-gray-200 bg-white p-2 rounded-xl shadow-xs">
        {[
          { id: 'overview', label: t.tabOverview, icon: FileText },
          { id: 'client', label: t.tabClient, icon: Building },
          { id: 'scope', label: t.tabScope, icon: Layers },
          { id: 'phases', label: t.tabPhases, icon: Calendar },
          { id: 'financial', label: t.tabFinancial, icon: DollarSign },
          { id: 'documents', label: t.tabDocuments, icon: FileDown },
          { id: 'handover', label: t.tabHandover, icon: ShieldCheck, highlight: project.status === 'completed' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : tab.highlight
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">{t.projectDescription}</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {project.description || (isRtl ? 'لا يوجد وصف مضاف' : 'No description provided')}
              </p>

              {project.idea && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">{t.projectIdea}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{project.idea}</p>
                </div>
              )}

              {project.goals && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">{t.projectGoals}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{project.goals}</p>
                </div>
              )}

              {project.targetAudience && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">{t.targetAudience}</h4>
                  <p className="text-xs text-slate-600">{project.targetAudience}</p>
                </div>
              )}
            </div>

            {/* Custom Fields on Project */}
            {project.customFields && project.customFields.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  {t.customFieldsSection}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.customFields.map((field) => (
                    <div key={field.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                      <span className="block text-[11px] font-semibold text-slate-500">{field.name}</span>
                      <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block break-all">
                        {String(field.value || '-')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Info Cards */}
          <div className="space-y-5">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                {isRtl ? 'المواصفات الفنية' : 'Technical Specs'}
              </h3>
              <div>
                <span className="block text-[11px] text-slate-500">{t.techStack}</span>
                <span className="text-xs font-mono font-semibold text-slate-800">{project.techStack || '-'}</span>
              </div>
              {project.expectedDeliveryDate && (
                <div>
                  <span className="block text-[11px] text-slate-500">{t.expectedDelivery}</span>
                  <span className="text-xs font-semibold text-slate-800">{project.expectedDeliveryDate}</span>
                </div>
              )}
              {project.startDate && (
                <div>
                  <span className="block text-[11px] text-slate-500">{t.colStartDate}</span>
                  <span className="text-xs font-semibold text-slate-800">{project.startDate}</span>
                </div>
              )}
              {project.technicalNotes && (
                <div>
                  <span className="block text-[11px] text-slate-500">{t.technicalNotes}</span>
                  <p className="text-xs text-slate-600 mt-0.5">{project.technicalNotes}</p>
                </div>
              )}
            </div>

            {/* Client Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">{t.clientSection}</h3>
              <div className="text-xs">
                <span className="block text-[11px] text-slate-500">{t.clientName}</span>
                <strong className="text-slate-800">{project.client?.name || '-'}</strong>
              </div>
              {project.client?.company && (
                <div className="text-xs">
                  <span className="block text-[11px] text-slate-500">{t.companyName}</span>
                  <span className="text-slate-700">{project.client.company}</span>
                </div>
              )}
              {project.client?.phone && (
                <div className="text-xs">
                  <span className="block text-[11px] text-slate-500">{t.phoneNumber}</span>
                  <span className="text-slate-700 font-mono">{project.client.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Client Details */}
      {activeTab === 'client' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">{t.clientSection}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[11px] text-slate-500">{t.clientName}</span>
              <span className="text-sm font-bold text-slate-900">{project.client?.name || '-'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[11px] text-slate-500">{t.companyName}</span>
              <span className="text-sm font-bold text-slate-900">{project.client?.company || '-'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[11px] text-slate-500">{t.phoneNumber}</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{project.client?.phone || '-'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[11px] text-slate-500">{t.emailAddress}</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{project.client?.email || '-'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[11px] text-slate-500">{t.country}</span>
              <span className="text-sm font-bold text-slate-900">{project.client?.country || '-'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[11px] text-slate-500">{t.address}</span>
              <span className="text-sm font-bold text-slate-900">{project.client?.address || '-'}</span>
            </div>
          </div>
          {project.client?.notes && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2">
              <span className="block text-[11px] text-slate-500">{t.clientNotes}</span>
              <p className="text-xs text-slate-700 mt-1">{project.client.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Scope of Work */}
      {activeTab === 'scope' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">{t.scopeSection}</h3>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {isRtl ? 'المجموع' : 'Subtotal'}: {(servicesTotal || 0).toLocaleString()} {currency}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3 text-start">#</th>
                  <th className="py-2.5 px-3 text-start">{t.taskTitle}</th>
                  <th className="py-2.5 px-3 text-start">{t.taskDescription}</th>
                  <th className="py-2.5 px-3 text-center">{t.duration}</th>
                  <th className="py-2.5 px-3 text-center">{t.quantity}</th>
                  <th className="py-2.5 px-3 text-end">{t.price}</th>
                  <th className="py-2.5 px-3 text-end">{isRtl ? 'الإجمالي' : 'Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(project.scopeItems || []).map((item, idx) => {
                  const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.title}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.description || '-'}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700">{item.duration || '-'}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity || 1}</td>
                      <td className="py-2.5 px-3 text-end font-mono">{(Number(item.price) || 0).toLocaleString()} {currency}</td>
                      <td className="py-2.5 px-3 text-end font-bold font-mono text-slate-900">{(itemTotal || 0).toLocaleString()} {currency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Execution Phases */}
      {activeTab === 'phases' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">{t.phasesSection}</h3>
          <div className="space-y-3">
            {(project.phases || []).map((phase, idx) => (
              <div key={phase.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Phase {idx + 1}:</span>
                    <h4 className="text-xs font-bold text-slate-900">{phase.name}</h4>
                  </div>
                  {phase.description && <p className="text-xs text-slate-600">{phase.description}</p>}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{t.phaseDuration}: <strong>{phase.duration || '-'}</strong></span>
                    {phase.expectedStartDate && <span>{t.phaseStart}: {phase.expectedStartDate}</span>}
                    {phase.expectedEndDate && <span>{t.phaseEnd}: {phase.expectedEndDate}</span>}
                  </div>
                </div>
                <div className="text-end shrink-0">
                  <span className="text-[11px] text-slate-500 block">{t.phaseAmount}</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{phase.amountOrPercentage || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Financial Breakdown */}
      {activeTab === 'financial' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">{t.financialSection}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">{t.servicesSubtotal}</span>
                <span className="font-bold font-mono text-slate-900">{(servicesTotal || 0).toLocaleString()} {currency}</span>
              </div>
              {setupFee > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">{t.setupFees}</span>
                  <span className="font-mono text-slate-900">{(setupFee || 0).toLocaleString()} {currency}</span>
                </div>
              )}
              {additionalFee > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">{t.additionalFees}</span>
                  <span className="font-mono text-slate-900">{(additionalFee || 0).toLocaleString()} {currency}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
                  <span>{t.discount}</span>
                  <span className="font-mono">-{(discount || 0).toLocaleString()} {currency}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-slate-800 text-sm font-bold text-slate-900 bg-slate-50 px-3 rounded-md">
                <span>{t.finalTotal}</span>
                <span className="font-mono text-base">{(finalTotal || 0).toLocaleString()} {currency}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">{t.paymentMethod}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {project.paymentMethod?.type === '50_50'
                  ? t.payment_50_50
                  : project.paymentMethod?.type === 'milestones'
                  ? t.payment_milestones
                  : project.paymentMethod?.type === 'full_upfront'
                  ? t.payment_full_upfront
                  : project.paymentMethod?.customText || settings.defaultPaymentTerms}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Documents & Quotation */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-gray-100 pb-3">{t.tabDocuments}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quotation Doc */}
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileDown className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">{isRtl ? 'عرض السعر الرسمي (.docx)' : 'Official Quotation (.docx)'}</h4>
                </div>
                <p className="text-xs text-slate-600">
                  {isRtl
                    ? 'ملف Word احترافي يحتوي على نطاق العمل، الأسعار، الجداول، شروط الدفع، وخانة اعتماد العميل.'
                    : 'Structured Word proposal containing scope, pricing tables, payment terms, and client signoff.'}
                </p>
                <span className="text-[11px] font-mono text-slate-500 block mt-2">
                  Quotation-{project.client?.name || 'Client'}-{project.name}.docx
                </span>
              </div>
              <button
                type="button"
                onClick={() => generateQuotationDocx(project, settings, language)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-200"
              >
                <FileDown className="w-4 h-4" />
                {t.generateQuotationDocx}
              </button>
            </div>

            {/* Handover Doc */}
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">{isRtl ? 'وثيقة تسليم المشروع (.docx)' : 'Handover Document (.docx)'}</h4>
                </div>
                <p className="text-xs text-slate-600">
                  {isRtl
                    ? 'ملف Word يحتوي على كافة بيانات السيرفر والاستضافة وبيانات لوحة الإدارة والحسابات الحساسة لتسليمها للعميل.'
                    : 'Structured Word document with server credentials, admin passwords, repo links, and maintenance notes.'}
                </p>
                <span className="text-[11px] font-mono text-slate-500 block mt-2">
                  Handover-{project.client?.name || 'Client'}-{project.name}.docx
                </span>
              </div>
              <button
                type="button"
                onClick={() => generateHandoverDocx(project, settings, language)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-md shadow-emerald-200"
              >
                <FileDown className="w-4 h-4" />
                {t.generateHandoverDocx}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Handover */}
      {activeTab === 'handover' && (
        <HandoverSection project={project} />
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title={t.confirmApproveTitle}
        description={t.confirmApproveDesc}
        variant="success"
      />

      <ConfirmModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleComplete}
        title={t.confirmCompleteTitle}
        description={t.confirmCompleteDesc}
        variant="success"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteProject(project.id)}
        title={t.confirmDeleteTitle}
        description={t.confirmDeleteDesc}
        variant="danger"
      />
    </div>
  );
};
