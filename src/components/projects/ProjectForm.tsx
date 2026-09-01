import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  FileDown,
  Save,
  Layers,
  Sparkles,
  Building,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  Check,
} from 'lucide-react';
import { Project, Client, ScopeItem, ProjectPhase, ProjectType, PaymentMethodType, CustomField } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { CustomFieldsManager } from './CustomFieldsManager';
import { generateQuotationDocx } from '../../utils/docxGenerator';

interface ProjectFormProps {
  initialProject?: Project;
  onSave?: (project: Project) => void;
  onCancel?: () => void;
}

const SCOPE_PRESETS = [
  { title: 'UI/UX Design & Prototyping', desc: 'تصميم الواجهات وتجربة المستخدم ونماذج العمل التفاعلية', price: 1200, duration: '7 أيام' },
  { title: 'Frontend Development', desc: 'برمجة الواجهات الأمامية متجاوبة وسريعة', price: 2000, duration: '14 يوماً' },
  { title: 'Backend & Database Architecture', desc: 'بناء الخدمات الخلفية وقواعد البيانات والمصادقة', price: 2500, duration: '18 يوماً' },
  { title: 'API & Third-party Integrations', desc: 'ربط بوابات الدفع، والرسائل، والخرائط، والخدمات السحابية', price: 800, duration: '5 أيام' },
  { title: 'Admin Dashboard', desc: 'لوحة تحكم إدارية شاملة لإدارة المحتوى والتقارير', price: 1500, duration: '10 أيام' },
  { title: 'Cloud Deployment & Server Setup', desc: 'إعداد السيرفر وشهادات SSL وربط النطاق والنسخ الاحتياطي', price: 500, duration: '3 أيام' },
  { title: 'Testing & Quality Assurance', desc: 'فحص الأداء والأمان والتوافق على مختلف المتصفحات والشاشات', price: 400, duration: '4 أيام' },
  { title: 'Maintenance & Post-Launch Support', desc: 'دعم فني وضمان إصلاح الأخطاء لمدة 30 يوماً', price: 300, duration: '30 يوماً' },
];

const PHASE_PRESETS = [
  { name: 'Phase 1 — Analysis & Planning', desc: 'تحليل المتطلبات وهيكلية النظام', duration: '5 أيام', amount: '20%' },
  { name: 'Phase 2 — UI/UX Design', desc: 'تصميم واجهات المستخدم ونماذج العمل', duration: '10 أيام', amount: '20%' },
  { name: 'Phase 3 — Development', desc: 'البرمجة والتطوير الفعلي للواجهات والخلفية', duration: '20 يوماً', amount: '40%' },
  { name: 'Phase 4 — Testing & QA', desc: 'فحص الجودة والتوافق والأمان', duration: '5 أيام', amount: '10%' },
  { name: 'Phase 5 — Deployment & Handover', desc: 'النشر المباشر وتسليم كافة الحسابات والشفرات', duration: '3 أيام', amount: '10%' },
];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialProject,
  onSave,
  onCancel,
}) => {
  const { language, clients, addClient, addProject, updateProject, settings, setCurrentView, setSelectedProjectId } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  // Mode: Existing client or new client
  const [clientMode, setClientMode] = useState<'existing' | 'new'>(
    initialProject ? 'existing' : clients.length > 0 ? 'existing' : 'new'
  );
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialProject?.clientId || (clients[0]?.id ?? '')
  );

  // New Client Fields
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCountry, setNewClientCountry] = useState(isRtl ? 'المملكة العربية السعودية' : 'Saudi Arabia');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Project Info
  const [projectName, setProjectName] = useState(initialProject?.name || '');
  const [projectType, setProjectType] = useState<ProjectType>(initialProject?.type || 'website');
  const [customType, setCustomType] = useState(initialProject?.customType || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [idea, setIdea] = useState(initialProject?.idea || '');
  const [goals, setGoals] = useState(initialProject?.goals || '');
  const [targetAudience, setTargetAudience] = useState(initialProject?.targetAudience || '');
  const [techStack, setTechStack] = useState(initialProject?.techStack || 'React, Node.js, TailwindCSS');
  const [technicalNotes, setTechnicalNotes] = useState(initialProject?.technicalNotes || '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(initialProject?.expectedDeliveryDate || '');

  // Scope Items
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>(
    initialProject?.scopeItems || [
      { id: 'sc-1', title: 'UI/UX Design', description: 'تصميم الواجهات كاملة ونماذج Figma', quantity: 1, price: 1200, duration: '7 أيام', notes: '', order: 1 },
      { id: 'sc-2', title: 'Frontend & Backend Development', description: 'تطوير وبرمجة النظام وربط قواعد البيانات', quantity: 1, price: 2800, duration: '20 يوماً', notes: '', order: 2 },
    ]
  );

  // Phases
  const [phases, setPhases] = useState<ProjectPhase[]>(
    initialProject?.phases || [
      { id: 'ph-1', name: 'Phase 1 — UI/UX Design', description: 'التصميم والاعتماد', duration: '7 أيام', expectedStartDate: '', expectedEndDate: '', amountOrPercentage: '50%', notes: '', order: 1 },
      { id: 'ph-2', name: 'Phase 2 — Development & Handover', description: 'البرمجة والتسليم النهائي', duration: '20 يوماً', expectedStartDate: '', expectedEndDate: '', amountOrPercentage: '50%', notes: '', order: 2 },
    ]
  );

  // Financials
  const [setupFee, setSetupFee] = useState<number>(
    initialProject ? Number(initialProject.setupFee) : settings.defaultSetupFee || 150
  );
  const [additionalFee, setAdditionalFee] = useState<number>(Number(initialProject?.additionalFee) || 0);
  const [discount, setDiscount] = useState<number>(Number(initialProject?.discount) || 0);
  const [currency, setCurrency] = useState(initialProject?.currency || settings.currency || 'USD');
  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethodType>(
    initialProject?.paymentMethod.type || '50_50'
  );
  const [customPaymentText, setCustomPaymentText] = useState(
    initialProject?.paymentMethod.customText || ''
  );

  // Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initialProject?.customFields || []
  );

  // Calculations
  const servicesTotal = scopeItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const finalTotal = servicesTotal + Number(setupFee || 0) + Number(additionalFee || 0) - Number(discount || 0);

  // Handlers for Scope Items
  const addScopeItem = (preset?: typeof SCOPE_PRESETS[0]) => {
    const newItem: ScopeItem = {
      id: `sc-${Date.now()}`,
      title: preset?.title || '',
      description: preset?.desc || '',
      quantity: 1,
      price: preset?.price || 500,
      duration: preset?.duration || '5 أيام',
      notes: '',
      order: scopeItems.length + 1,
    };
    setScopeItems([...scopeItems, newItem]);
  };

  const updateScopeItem = (id: string, updates: Partial<ScopeItem>) => {
    setScopeItems(scopeItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteScopeItem = (id: string) => {
    setScopeItems(scopeItems.filter((item) => item.id !== id));
  };

  const moveScopeItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === scopeItems.length - 1)) return;
    const newItems = [...scopeItems];
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[target];
    newItems[target] = temp;
    setScopeItems(newItems);
  };

  // Handlers for Phases
  const addPhaseItem = (preset?: typeof PHASE_PRESETS[0]) => {
    const newPhase: ProjectPhase = {
      id: `ph-${Date.now()}`,
      name: preset?.name || `Phase ${phases.length + 1}`,
      description: preset?.desc || '',
      duration: preset?.duration || '7 أيام',
      expectedStartDate: '',
      expectedEndDate: '',
      amountOrPercentage: preset?.amount || '25%',
      notes: '',
      order: phases.length + 1,
    };
    setPhases([...phases, newPhase]);
  };

  const updatePhaseItem = (id: string, updates: Partial<ProjectPhase>) => {
    setPhases(phases.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePhaseItem = (id: string) => {
    setPhases(phases.filter((p) => p.id !== id));
  };

  const movePhaseItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === phases.length - 1)) return;
    const newPhases = [...phases];
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = newPhases[index];
    newPhases[index] = newPhases[target];
    newPhases[target] = temp;
    setPhases(newPhases);
  };

  // Save Project
  const handleSave = (andGenerateDocx = false) => {
    if (!projectName.trim()) {
      alert(isRtl ? 'يرجى إدخال اسم المشروع' : 'Please enter project name');
      return;
    }

    let finalClientId = selectedClientId;

    // Create client if new
    if (clientMode === 'new') {
      if (!newClientName.trim()) {
        alert(isRtl ? 'يرجى إدخال اسم العميل' : 'Please enter client name');
        return;
      }
      const createdClient = addClient({
        name: newClientName.trim(),
        company: newClientCompany.trim(),
        phone: newClientPhone.trim(),
        email: newClientEmail.trim(),
        country: newClientCountry.trim(),
        address: newClientAddress.trim(),
        notes: newClientNotes.trim(),
      });
      finalClientId = createdClient.id;
    }

    const projectData: Partial<Project> = {
      name: projectName.trim(),
      type: projectType,
      customType: customType.trim(),
      clientId: finalClientId,
      description: description.trim(),
      idea: idea.trim(),
      goals: goals.trim(),
      targetAudience: targetAudience.trim(),
      techStack: techStack.trim(),
      technicalNotes: technicalNotes.trim(),
      expectedDeliveryDate,
      scopeItems,
      phases,
      setupFee: Number(setupFee) || 0,
      additionalFee: Number(additionalFee) || 0,
      discount: Number(discount) || 0,
      currency,
      paymentMethod: {
        type: paymentMethodType,
        customText: customPaymentText,
      },
      customFields,
      status: initialProject?.status || 'quotation_ready',
    };

    let savedProject: Project;
    if (initialProject) {
      updateProject(initialProject.id, projectData);
      savedProject = { ...initialProject, ...projectData } as Project;
    } else {
      savedProject = addProject(projectData);
    }

    if (andGenerateDocx) {
      // Find client object
      const clientObj = clients.find((c) => c.id === finalClientId) || {
        id: finalClientId,
        name: newClientName || 'Client',
        company: newClientCompany || '',
        phone: newClientPhone || '',
        email: newClientEmail || '',
        country: newClientCountry || '',
        address: '',
        notes: '',
        createdAt: '',
        updatedAt: '',
      };
      generateQuotationDocx({ ...savedProject, client: clientObj }, settings, language);
    }

    if (onSave) {
      onSave(savedProject);
    } else {
      setSelectedProjectId(savedProject.id);
      setCurrentView('project_details');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel || (() => setCurrentView('projects'))}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {initialProject ? (isRtl ? `تعديل مشروع: ${initialProject.name}` : `Edit Project: ${initialProject.name}`) : t.newProject}
            </h1>
            <p className="text-xs text-slate-500">
              {isRtl ? 'أدخل البيانات لإنشاء عرض سعر فوري وبدء دورة المشروع' : 'Fill project details to generate instant quotation and start project lifecycle'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Save className="w-4 h-4" />
            {t.save}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4" />
            {t.generateQuotationDocx}
          </button>
        </div>
      </div>

      {/* SECTION 1: Client Information */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            {t.clientSection}
          </h2>
          <div className="inline-flex rounded-lg p-0.5 bg-gray-100 border border-gray-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setClientMode('existing')}
              className={`px-3 py-1 rounded-md transition-colors ${
                clientMode === 'existing' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.selectExistingClient}
            </button>
            <button
              type="button"
              onClick={() => setClientMode('new')}
              className={`px-3 py-1 rounded-md transition-colors ${
                clientMode === 'new' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.orCreateNewClient}
            </button>
          </div>
        </div>

        {clientMode === 'existing' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.selectExistingClient} <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''} - {c.country}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.clientName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="محمد بن عبد الله"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.companyName}</label>
              <input
                type="text"
                value={newClientCompany}
                onChange={(e) => setNewClientCompany(e.target.value)}
                placeholder="مؤسسة الأعمال المبتكرة"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phoneNumber}</label>
              <input
                type="text"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                placeholder="+966 50 000 0000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.emailAddress}</label>
              <input
                type="email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="client@domain.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.country}</label>
              <input
                type="text"
                value={newClientCountry}
                onChange={(e) => setNewClientCountry(e.target.value)}
                placeholder="المملكة العربية السعودية"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.address}</label>
              <input
                type="text"
                value={newClientAddress}
                onChange={(e) => setNewClientAddress(e.target.value)}
                placeholder="الرياض، حي الملقا"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Project Specifications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <FileText className="w-4 h-4 text-blue-600" />
          {t.projectInfoSection}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.projectName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="مثال: تطوير منصة التجارة والاستثمار الرقمي"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.projectType}</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="website">{t.type_website}</option>
              <option value="webapp">{t.type_webapp}</option>
              <option value="mobile">{t.type_mobile}</option>
              <option value="ecommerce">{t.type_ecommerce}</option>
              <option value="other">{t.type_other}</option>
            </select>
          </div>
        </div>

        {projectType === 'other' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.customTypeLabel}</label>
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="e.g. AI SaaS Platform / CRM System"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.projectDescription}</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للمشروع والخدمات المقدمة..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.projectIdea}</label>
            <textarea
              rows={2}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="فكرة المشروع والحل الذي يقدمه..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.projectGoals}</label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="أهداف المشروع ومؤشرات النجاح..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.targetAudience}</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="الجمهور المستهدف والمستخدمون..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.techStack}</label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React, Next.js, Node.js, PostgreSQL, Docker"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.expectedDelivery}</label>
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.technicalNotes}</label>
          <textarea
            rows={2}
            value={technicalNotes}
            onChange={(e) => setTechnicalNotes(e.target.value)}
            placeholder="ملاحظات فنية، بنية الاستضافة، متطلبات خاصة..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* SECTION 3: Scope of Work */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              {t.scopeSection}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl ? 'أضف الخدمات والمهام مع أسعارها ومدد تنفيذها لإدراجها في عرض السعر' : 'Add deliverables, unit pricing, and estimated durations for quotation'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => addScopeItem()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addItem}
          </button>
        </div>

        {/* Preset suggestions chips */}
        <div className="flex flex-wrap items-center gap-1.5 py-1">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 me-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {isRtl ? 'إضافة سريعة:' : 'Quick Add:'}
          </span>
          {SCOPE_PRESETS.slice(0, 6).map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addScopeItem(preset)}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-colors"
            >
              + {preset.title}
            </button>
          ))}
        </div>

        {/* Scope Items List */}
        <div className="space-y-3">
          {scopeItems.map((item, idx) => (
            <div
              key={item.id}
              className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 space-y-2 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveScopeItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveScopeItem(idx, 'down')}
                    disabled={idx === scopeItems.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteScopeItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateScopeItem(item.id, { title: e.target.value })}
                    placeholder={t.taskTitle}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => updateScopeItem(item.id, { duration: e.target.value })}
                    placeholder={t.duration}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateScopeItem(item.id, { quantity: Number(e.target.value) || 1 })}
                    placeholder={t.quantity}
                    min={1}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateScopeItem(item.id, { price: Number(e.target.value) || 0 })}
                    placeholder={`${t.price} (${currency})`}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-mono font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateScopeItem(item.id, { description: e.target.value })}
                  placeholder={t.taskDescription}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Execution Phases */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              {t.phasesSection}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl ? 'تقسيم المشروع لمراحل تنفيذ وجدول زمني ودفعات مستحقة' : 'Milestone phases, timeline, and installment schedule'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => addPhaseItem()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addPhase}
          </button>
        </div>

        {/* Preset phases */}
        <div className="flex flex-wrap items-center gap-1.5 py-1">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 me-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {isRtl ? 'إضافة مرحلة:' : 'Preset Phases:'}
          </span>
          {PHASE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addPhaseItem(preset)}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-colors"
            >
              + {preset.name}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {phases.map((phase, idx) => (
            <div
              key={phase.id}
              className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 space-y-2 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => movePhaseItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhaseItem(idx, 'down')}
                    disabled={idx === phases.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePhaseItem(phase.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={phase.name}
                    onChange={(e) => updatePhaseItem(phase.id, { name: e.target.value })}
                    placeholder={t.phaseName}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={phase.duration}
                    onChange={(e) => updatePhaseItem(phase.id, { duration: e.target.value })}
                    placeholder={t.phaseDuration}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={phase.amountOrPercentage}
                    onChange={(e) => updatePhaseItem(phase.id, { amountOrPercentage: e.target.value })}
                    placeholder="الاستحقاق: e.g. 30% أو 1500 USD"
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={phase.description}
                  onChange={(e) => updatePhaseItem(phase.id, { description: e.target.value })}
                  placeholder={t.phaseDescription}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: Financials & Payment Terms */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <DollarSign className="w-4 h-4 text-blue-600" />
          {t.financialSection}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.servicesSubtotal}</label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-slate-900 font-bold font-mono">
              {(servicesTotal || 0).toLocaleString()} {currency}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setupFees}</label>
            <input
              type="number"
              value={setupFee}
              onChange={(e) => setSetupFee(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.discount}</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 font-mono text-rose-600 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.finalTotal}</label>
            <div className="w-full rounded-lg border border-blue-600 bg-blue-600 text-white px-3 py-2 text-xs font-bold font-mono shadow-md shadow-blue-200">
              {(finalTotal || 0).toLocaleString()} {currency}
            </div>
          </div>
        </div>

        {/* Payment terms */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-700">{t.paymentMethod}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: '50_50', label: t.payment_50_50 },
              { id: 'milestones', label: t.payment_milestones },
              { id: 'full_upfront', label: t.payment_full_upfront },
              { id: 'custom', label: t.payment_custom },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethodType(method.id as PaymentMethodType)}
                className={`p-3 rounded-xl border text-xs text-start font-medium transition-all ${
                  paymentMethodType === method.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs'
                    : 'border-gray-200 bg-white text-slate-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>

          {paymentMethodType === 'custom' && (
            <textarea
              rows={2}
              value={customPaymentText}
              onChange={(e) => setCustomPaymentText(e.target.value)}
              placeholder={t.customPaymentPlaceholder}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          )}
        </div>
      </div>

      {/* SECTION 6: Project-Specific Custom Fields */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
        <CustomFieldsManager
          fields={customFields}
          onChange={setCustomFields}
          title={t.customFieldsSection}
          description={
            isRtl
              ? 'أضف أي حقول ومعلومات خاصة بهذا المشروع (مثل Figma link, Firebase ID, Apple Dev Account, إلخ)'
              : 'Add arbitrary custom attributes specific to this project'
          }
          defaultIncludeInQuotation={true}
          defaultIncludeInHandover={true}
        />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
        <button
          type="button"
          onClick={onCancel || (() => setCurrentView('projects'))}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {t.cancel}
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Save className="w-4 h-4" />
            {t.save}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4" />
            {t.generateQuotationDocx}
          </button>
        </div>
      </div>
    </div>
  );
};
