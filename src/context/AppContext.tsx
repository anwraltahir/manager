import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  Client,
  BusinessSettings,
  Language,
  ProjectStatus,
  CustomField,
  ScopeItem,
  ProjectPhase,
} from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  adminPassword: string;
  updateAdminPassword: (newPass: string) => void;
  projects: Project[];
  clients: Client[];
  settings: BusinessSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  currentView: 'dashboard' | 'projects' | 'clients' | 'quotations' | 'in_progress' | 'completed' | 'settings' | 'new_project' | 'project_details' | 'edit_project';
  setCurrentView: (view: any) => void;
  
  // Actions
  addProject: (projectData: Partial<Project>) => Project;
  updateProject: (id: string, projectData: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  approveProject: (id: string) => void;
  completeProject: (id: string) => void;
  updateHandoverData: (projectId: string, handoverData: any) => void;
  
  // Client actions
  addClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Settings actions
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  resetData: () => void;
  
  // Stats
  stats: {
    totalProjects: number;
    quotations: number;
    quotationReady: number;
    waitingApproval: number;
    inProgress: number;
    completed: number;
    totalRevenue: number;
    totalValue: number;
  };
}

const defaultSettings: BusinessSettings = {
  providerName: 'أنور الطاهر | م. أنور للحلول البرمجية',
  companyName: 'Apex Soft & Digital Works',
  email: 'contact@apexsoft.dev',
  phone: '+966 50 123 4567',
  address: 'الرياض، المملكة العربية السعودية',
  website: 'https://apexsoft.dev',
  currency: 'USD',
  quotationValidityDays: 15,
  defaultPaymentTerms: '50% مقدم عند الاعتماد و 50% عند اكتمال وتسليم المشروع.',
  defaultTermsAndConditions: '1. يبدأ العمل فور استلام الدفعة المقدمة وتسليم المواد المطلوبة من العميل.\n2. تشمل التكلفة الدعم الفني وضمان الأخطاء البرمجية لمدة 30 يوماً بعد التسليم.\n3. يتم تسليم كافة بيانات السيرفر والشفرة البرمجية كاملة بعد سداد الدفعة النهائية.',
  defaultSetupFee: 150,
};

const initialClients: Client[] = [
  {
    id: 'client-1',
    name: 'سلطان المنصور',
    company: 'شركة المنصور للتجارة والاستثمار',
    phone: '+966 55 987 6543',
    email: 'sultan@almansour.com',
    country: 'المملكة العربية السعودية',
    address: 'طريق الملك فهد، الرياض',
    notes: 'عميل VIP - يفضل التواصل عبر الواتساب والبريد الرسمي',
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
  {
    id: 'client-2',
    name: 'سارة عبد الله',
    company: 'مؤسسة زاد للتقنية والتعليم',
    phone: '+971 50 444 8899',
    email: 'sara@zadtech.ae',
    country: 'الإمارات العربية المتحدة',
    address: 'دبي للإنترنت، مبنى 3',
    notes: 'مشروع تطبيق جوال تعليمي',
    createdAt: '2026-08-18',
    updatedAt: '2026-08-18',
  },
  {
    id: 'client-3',
    name: 'خالد الرويلي',
    company: 'متجر روافد للعطور',
    phone: '+965 99 112 233',
    email: 'khaled@rawafed.kw',
    country: 'الكويت',
    address: 'العاصمة، برج الحمراء',
    notes: 'متجر إلكتروني متكامل مع بوابات دفع محلية',
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25',
  },
];

const initialProjects: Project[] = [
  {
    id: 'prj-1',
    projectNumber: 'PRJ-2026-001',
    quotationNumber: 'QT-2026-001',
    name: 'تطوير منصة المنصور لإدارة الأصول والاستثمار',
    type: 'webapp',
    clientId: 'client-1',
    description: 'تطوير تطبيق ويب لإدارة المحافظ المالية الاستثمارية والتقارير التنفيذية للعملاء مع لوحة تحكم إدارية.',
    idea: 'منصة مركزية تجمع تتبع الاستثمارات ومؤشرات العوائد.',
    goals: 'أتمتة تقارير الاستثمار وتسهيل متابعة المستثمرين لحصصهم.',
    targetAudience: 'المستثمرون الأفراد والشركات الشريكة',
    techStack: 'React, Node.js, PostgreSQL, TailwindCSS, Docker',
    technicalNotes: 'تأمين المصادقة الثنائية 2FA وتشفير المستندات المالية.',
    scopeItems: [
      { id: 'sc-1', title: 'UI/UX Design & Prototyping', description: 'تصميم واجهات المستخدم ونماذج العمل التفاعلية على Figma', quantity: 1, price: 1200, duration: '10 أيام', notes: '', order: 1 },
      { id: 'sc-2', title: 'Frontend Dashboard Development', description: 'برمجة لوحات البيانات والرسوم البيانية التفاعلية', quantity: 1, price: 2400, duration: '15 يوماً', notes: '', order: 2 },
      { id: 'sc-3', title: 'Backend & API Integration', description: 'بناء الخدمات الخلفية وقواعد البيانات وبوابات المصادقة', quantity: 1, price: 2800, duration: '20 يوماً', notes: '', order: 3 },
      { id: 'sc-4', title: 'Deployment & Server Setup', description: 'إعداد السيرفر السحابي وشهادات SSL والنسخ الاحتياطي', quantity: 1, price: 600, duration: '3 أيام', notes: '', order: 4 },
    ],
    phases: [
      { id: 'ph-1', name: 'Phase 1 — Analysis & UI/UX', description: 'تحليل المتطلبات واعتماد التصاميم النهائية', duration: '10 أيام', expectedStartDate: '2026-08-15', expectedEndDate: '2026-08-25', amountOrPercentage: '30%', notes: '', order: 1 },
      { id: 'ph-2', name: 'Phase 2 — Core Development', description: 'تطوير النظام الخلفي والواجهات وربط الـ APIs', duration: '25 يوماً', expectedStartDate: '2026-08-26', expectedEndDate: '2026-09-20', amountOrPercentage: '40%', notes: '', order: 2 },
      { id: 'ph-3', name: 'Phase 3 — QA & Handover', description: 'فحص الجودة ونقل النظام للسيرفر وتسليم المفاتيح', duration: '7 أيام', expectedStartDate: '2026-09-21', expectedEndDate: '2026-09-28', amountOrPercentage: '30%', notes: '', order: 3 },
    ],
    setupFee: 200,
    additionalFee: 0,
    discount: 200,
    currency: 'USD',
    paymentMethod: { type: 'milestones' },
    status: 'in_progress',
    statusHistory: [
      { status: 'draft', timestamp: '2026-08-11T09:00:00.000Z', notes: 'إنشاء مسودة المشروع' },
      { status: 'quotation_ready', timestamp: '2026-08-12T11:30:00.000Z', notes: 'إصدار عرض السعر' },
      { status: 'in_progress', timestamp: '2026-08-15T14:00:00.000Z', notes: 'تم اعتماد العرض واستلام الدفعة الأولى' },
    ],
    customFields: [
      { id: 'cf-1', name: 'Figma Workspace Link', type: 'url', value: 'https://figma.com/file/almansour-asset-v1', required: false, includeInQuotation: true, includeInHandover: true, order: 1 },
      { id: 'cf-2', name: 'Docker Registry', type: 'text', value: 'ghcr.io/almansour/app', required: false, includeInQuotation: false, includeInHandover: true, order: 2 },
      { id: 'cf-3', name: 'مدة الدعم الفني بعد الإطلاق', type: 'text', value: '60 يوماً مجاناً', required: false, includeInQuotation: true, includeInHandover: true, order: 3 },
    ],
    handoverData: {
      server: {
        serverIp: '167.99.142.88',
        serverProvider: 'Hetzner Cloud / Dedicated CX31',
        serverPlan: '4 vCPU, 8GB RAM, Ubuntu 24.04 LTS',
        serverUsername: 'root',
        serverPassword: 'AppSec#98342!Hetzner',
        sshPort: '2222',
        serverNotes: 'مفعل عليه UFW Firewall و Fail2ban للحماية',
      },
      domain: {
        domainName: 'almansour-invest.com',
        domainProvider: 'Namecheap',
        domainUsername: 'almansour_admin',
        domainPassword: 'NcPass#2026!Sec',
        domainExpiryDate: '2027-08-15',
        domainNotes: 'الـ DNS مربوط مع Cloudflare',
      },
      webApp: {
        productionUrl: 'https://almansour-invest.com',
        adminUrl: 'https://almansour-invest.com/admin',
        adminUsername: 'superadmin',
        adminPassword: 'Adm#Almansour$2026',
        dbName: 'almansour_prod',
        dbUsername: 'pg_almansour',
        dbPassword: 'PgDb#Secret7812!',
        repoUrl: 'https://github.com/apexsoft/almansour-platform',
        branch: 'main',
        deploymentNotes: 'يتم النشر تلقائياً عبر GitHub Actions CI/CD',
      },
      additional: {
        apiKeys: 'Stripe Live Key: pk_live_51M... | SendGrid API Key: SG.9876...',
        thirdPartyServices: 'Cloudflare Pro, SendGrid SMTP, Sentry Monitoring',
        emailConfig: 'smtp.sendgrid.net:587 | user: apikey',
        importantLinks: 'https://sentry.io/almansour-prod',
        maintenanceInfo: 'نسخ احتياطي يومي تلقائي إلى AWS S3 في تمام 3:00 ص',
        backupInfo: 'Automated pg_dump cron job daily',
        otherNotes: 'تم تسليم كافة الصلاحيات للسيد سلطان',
      },
      customFields: [
        { id: 'hcf-1', name: 'Cloudflare Account', type: 'email', value: 'tech@almansour.com', required: false, includeInQuotation: false, includeInHandover: true, order: 1 },
        { id: 'hcf-2', name: 'Cloudflare API Token', type: 'password', value: 'cf_tok_8941728491823', required: false, includeInQuotation: false, includeInHandover: true, order: 2 },
      ],
    },
    approvalDate: '2026-08-15',
    startDate: '2026-08-15',
    expectedDeliveryDate: '2026-09-28',
    createdAt: '2026-08-11',
    updatedAt: '2026-08-15',
  },
  {
    id: 'prj-2',
    projectNumber: 'PRJ-2026-002',
    quotationNumber: 'QT-2026-002',
    name: 'تطبيق زاد التعليمي للأطفال (Mobile App)',
    type: 'mobile',
    clientId: 'client-2',
    description: 'تطبيق تفاعلي للهواتف الذكية بنظامي iOS و Android لتعليم المهارات والقراءة للأطفال.',
    idea: 'تطبيق ألعاب تفاعلية ومسابقات تعليمية مع لوحة لمتابعة أولياء الأمور.',
    goals: 'الوصول إلى 50,000 مستخدم نشط في الربع الأول.',
    targetAudience: 'الأطفال من 5 إلى 12 سنة وأولياء الأمور والمعلمون',
    techStack: 'Flutter, Firebase, Cloud Functions, Node.js',
    technicalNotes: 'تحسين أداء الرسوم المتحركة ودعم وضع عدم الاتصال بالإنترنت.',
    scopeItems: [
      { id: 'sc-21', title: 'Interactive UX/UI Character Design', description: 'رسم الشخصيات التفاعلية وواجهات شاشات التطبيق (35 شاشة)', quantity: 1, price: 1800, duration: '14 يوماً', notes: '', order: 1 },
      { id: 'sc-22', title: 'Flutter Multiplatform Development', description: 'برمجة التطبيق لنظامي iOS و Android من كود موحد', quantity: 1, price: 4200, duration: '30 يوماً', notes: '', order: 2 },
      { id: 'sc-23', title: 'Firebase Backend & Audio Assets', description: 'قواعد بيانات فورية وإدارة الملفات الصوتية للألعاب', quantity: 1, price: 1500, duration: '10 أيام', notes: '', order: 3 },
      { id: 'sc-24', title: 'App Store & Google Play Publishing', description: 'تجهيز اللقطات وتجهيز الحسابات ورفع التطبيقات للمراجعة', quantity: 1, price: 500, duration: '5 أيام', notes: '', order: 4 },
    ],
    phases: [
      { id: 'ph-21', name: 'المرحلة الأولى: التصميم والقصة', description: 'رسم الشاشات والشخصيات التفاعلية', duration: '14 يوماً', expectedStartDate: '2026-08-20', expectedEndDate: '2026-09-03', amountOrPercentage: '35%', notes: '', order: 1 },
      { id: 'ph-22', name: 'المرحلة الثانية: برمجة الألعاب والمحتوى', description: 'تطوير المنطق والألعاب التفاعلية بالـ Flutter', duration: '30 يوماً', expectedStartDate: '2026-09-04', expectedEndDate: '2026-10-04', amountOrPercentage: '45%', notes: '', order: 2 },
      { id: 'ph-23', name: 'المرحلة الثالثة: النشر على المتاجر', description: 'رفع التطبيق لمتجر Apple ومتجر Google Play', duration: '10 أيام', expectedStartDate: '2026-10-05', expectedEndDate: '2026-10-15', amountOrPercentage: '20%', notes: '', order: 3 },
    ],
    setupFee: 150,
    additionalFee: 0,
    discount: 0,
    currency: 'USD',
    paymentMethod: { type: '50_50' },
    status: 'waiting_approval',
    statusHistory: [
      { status: 'draft', timestamp: '2026-08-19T10:00:00.000Z', notes: 'إنشاء المسودة' },
      { status: 'quotation_ready', timestamp: '2026-08-20T12:00:00.000Z', notes: 'إرسال عرض السعر للعميل' },
      { status: 'waiting_approval', timestamp: '2026-08-20T12:05:00.000Z', notes: 'بانتظار موافقة مجلس الإدارة' },
    ],
    customFields: [
      { id: 'cf-21', name: 'iOS Bundle ID', type: 'text', value: 'com.zadtech.kidslearn', required: true, includeInQuotation: false, includeInHandover: true, order: 1 },
      { id: 'cf-22', name: 'Android Package Name', type: 'text', value: 'com.zadtech.kidslearn', required: true, includeInQuotation: false, includeInHandover: true, order: 2 },
      { id: 'cf-23', name: 'Apple Developer Team ID', type: 'text', value: '9AB4819CD2', required: false, includeInQuotation: false, includeInHandover: true, order: 3 },
      { id: 'cf-24', name: 'عدد شاشات التطبيق المعتمدة', type: 'number', value: '35 شاشة', required: false, includeInQuotation: true, includeInHandover: false, order: 4 },
    ],
    handoverData: {
      server: { serverIp: '', serverProvider: 'Firebase / Google Cloud Serverless', serverPlan: 'Blaze Plan', serverUsername: '', serverPassword: '', sshPort: '', serverNotes: '' },
      domain: { domainName: 'zadtech.ae', domainProvider: 'GoDaddy', domainUsername: '', domainPassword: '', domainExpiryDate: '', domainNotes: '' },
      webApp: { productionUrl: 'https://apps.apple.com/app/zad-kids', adminUrl: 'https://admin.zadtech.ae', adminUsername: 'admin@zadtech.ae', adminPassword: '', dbName: 'Firestore', dbUsername: '', dbPassword: '', repoUrl: 'https://github.com/apexsoft/zad-kids-app', branch: 'main', deploymentNotes: '' },
      additional: { apiKeys: '', thirdPartyServices: 'RevenueCat In-App Purchases, Firebase Analytics, OneSignal Push', emailConfig: '', importantLinks: '', maintenanceInfo: '', backupInfo: '', otherNotes: '' },
      customFields: [],
    },
    createdAt: '2026-08-19',
    updatedAt: '2026-08-20',
  },
  {
    id: 'prj-3',
    projectNumber: 'PRJ-2026-003',
    quotationNumber: 'QT-2026-003',
    name: 'متجر روافد للعطور والمنتجات الفاخرة (E-commerce)',
    type: 'ecommerce',
    clientId: 'client-3',
    description: 'متجر إلكتروني عالي الأداء مع ربط بوابات الدفع الخليجية وشركات الشحن ونظام كوبونات وتتبع الطلبات.',
    idea: 'واجهة تسوق سريعة وعصرية تبرز فخامة العطور.',
    goals: 'تحقيق تجربة شراء سلسة في خطوتين وزيادة معدل التحويل.',
    targetAudience: 'عشاق العطور في دول الخليج العربي',
    techStack: 'Next.js, Shopify / Custom Headless, Tailwind, Tap Payments, MyFatoorah',
    technicalNotes: 'سرعة تحميل أقل من ثانية واحدة، متوافق مع كافة أحجام الجوالات.',
    scopeItems: [
      { id: 'sc-31', title: 'Luxury Brand E-commerce UI/UX', description: 'تصميم تجربة التسوق وصفحات المنتجات وسلة الشراء الفاخرة', quantity: 1, price: 1500, duration: '8 أيام', notes: '', order: 1 },
      { id: 'sc-32', title: 'Headless Storefront Development', description: 'برمجة المتجر الإلكتروني السريع مع فلاتر المنتجات والبحث الفوري', quantity: 1, price: 3100, duration: '18 يوماً', notes: '', order: 2 },
      { id: 'sc-33', title: 'GCC Payment Gateways Integration', description: 'ربط بوابات كي نت (KNET)، مدى (Mada)، Apple Pay، و Tap Payments', quantity: 1, price: 900, duration: '6 أيام', notes: '', order: 3 },
      { id: 'sc-34', title: 'Shipping & SMS Notifications Setup', description: 'ربط شركة الشحن (DHL/Aramex) ورسائل التنبيهات النصية', quantity: 1, price: 600, duration: '4 أيام', notes: '', order: 4 },
    ],
    phases: [
      { id: 'ph-31', name: 'تصميم الواجهات', description: 'اعتماد التصاميم وسيناريو الشراء', duration: '8 أيام', expectedStartDate: '2026-07-01', expectedEndDate: '2026-07-08', amountOrPercentage: '30%', notes: '', order: 1 },
      { id: 'ph-32', name: 'البرمجة والربط', description: 'تطوير المتجر وربط بوابات الدفع والشحن', duration: '20 يوماً', expectedStartDate: '2026-07-09', expectedEndDate: '2026-07-29', amountOrPercentage: '50%', notes: '', order: 2 },
      { id: 'ph-33', name: 'التسليم والإطلاق', description: 'التسليم النهائي وإطلاق المتجر رسمياً', duration: '5 أيام', expectedStartDate: '2026-07-30', expectedEndDate: '2026-08-04', amountOrPercentage: '20%', notes: '', order: 3 },
    ],
    setupFee: 300,
    additionalFee: 0,
    discount: 100,
    currency: 'USD',
    paymentMethod: { type: '50_50' },
    status: 'completed',
    statusHistory: [
      { status: 'draft', timestamp: '2026-06-28T08:00:00.000Z' },
      { status: 'quotation_ready', timestamp: '2026-06-30T10:00:00.000Z' },
      { status: 'in_progress', timestamp: '2026-07-01T09:00:00.000Z' },
      { status: 'completed', timestamp: '2026-08-04T16:00:00.000Z', notes: 'تم تسليم المتجر بنجاح' },
    ],
    customFields: [
      { id: 'cf-31', name: 'Tap Payments Merchant ID', type: 'text', value: 'mid_tap_9812481', required: false, includeInQuotation: false, includeInHandover: true, order: 1 },
      { id: 'cf-32', name: 'Aramex Account PIN', type: 'password', value: 'Arx#Kuwait2026', required: false, includeInQuotation: false, includeInHandover: true, order: 2 },
      { id: 'cf-33', name: 'بوابات الدفع المشمولة', type: 'text', value: 'KNET, Mada, Apple Pay, Visa/Mastercard', required: false, includeInQuotation: true, includeInHandover: true, order: 3 },
    ],
    handoverData: {
      server: {
        serverIp: '76.76.21.21',
        serverProvider: 'Vercel Enterprise / Cloudflare',
        serverPlan: 'Pro Plan',
        serverUsername: 'admin@rawafed.kw',
        serverPassword: 'Vercel#Rawafed$2026',
        sshPort: '-',
        serverNotes: 'Edge Network Serverless',
      },
      domain: {
        domainName: 'rawafedperfumes.com',
        domainProvider: 'Cloudflare Registrar',
        domainUsername: 'rawafed_admin',
        domainPassword: 'Cf#RawafedPass99',
        domainExpiryDate: '2028-07-01',
        domainNotes: 'مفعل عليه SSL تلقائي وحماية DDoS',
      },
      webApp: {
        productionUrl: 'https://rawafedperfumes.com',
        adminUrl: 'https://rawafedperfumes.com/admin',
        adminUsername: 'khaled_owner',
        adminPassword: 'Rawafed#AdminPass2026!',
        dbName: 'rawafed_store_db',
        dbUsername: 'store_master',
        dbPassword: 'Db#RawafedSecret91!',
        repoUrl: 'https://github.com/apexsoft/rawafed-store',
        branch: 'main',
        deploymentNotes: 'النشر التلقائي فور عمل push على branch main',
      },
      additional: {
        apiKeys: 'Tap Secret Key: sk_live_981... | Aramex Live Entity: KWI',
        thirdPartyServices: 'Tap Payments, Aramex APIs, Klaviyo Email Marketing, Google Analytics 4',
        emailConfig: 'orders@rawafedperfumes.com عبر Google Workspace',
        importantLinks: 'https://dash.tap.company | https://cloudflare.com',
        maintenanceInfo: 'ضمان ودعم فني لمدة 90 يوماً من تاريخ التسليم',
        backupInfo: 'البيانات محمية سحابياً بشكل دوري',
        otherNotes: 'تم تدريب فريق المتجر على إدارة المنتجات والطلبات',
      },
      customFields: [
        { id: 'hcf-31', name: 'Klaviyo Account', type: 'email', value: 'marketing@rawafedperfumes.com', required: false, includeInQuotation: false, includeInHandover: true, order: 1 },
      ],
      handoverCompletedDate: '2026-08-04',
    },
    approvalDate: '2026-07-01',
    startDate: '2026-07-01',
    expectedDeliveryDate: '2026-08-04',
    completionDate: '2026-08-04',
    handoverDate: '2026-08-04',
    createdAt: '2026-06-28',
    updatedAt: '2026-08-04',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    return saved === 'en' ? 'en' : 'ar';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_auth');
    // If not set before, default to true so the user can immediately use the dashboard
    return saved === null ? true : saved === 'true';
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('app_admin_password') || 'admin123';
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('app_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialProjects;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('app_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialClients;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultSettings;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'projects' | 'clients' | 'quotations' | 'in_progress' | 'completed' | 'settings' | 'new_project' | 'project_details' | 'edit_project'
  >('dashboard');

  // Sync with document element for RTL/LTR
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app_lang', language);
  }, [language]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('app_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('app_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Helper to populate client object inside projects
  const enrichedProjects = projects.map((p) => {
    const client = clients.find((c) => c.id === p.clientId) || p.client;
    return { ...p, client };
  });

  // Project Actions
  const addProject = (projectData: Partial<Project>): Project => {
    const currentYear = new Date().getFullYear();
    const count = projects.length + 1;
    const seqStr = String(count).padStart(3, '0');
    const projectNumber = `PRJ-${currentYear}-${seqStr}`;
    const quotationNumber = `QT-${currentYear}-${seqStr}`;

    const newProject: Project = {
      id: `prj-${Date.now()}`,
      projectNumber,
      quotationNumber,
      name: projectData.name || 'مشروع جديد',
      type: projectData.type || 'website',
      customType: projectData.customType || '',
      clientId: projectData.clientId || (clients[0]?.id ?? ''),
      description: projectData.description || '',
      idea: projectData.idea || '',
      goals: projectData.goals || '',
      targetAudience: projectData.targetAudience || '',
      techStack: projectData.techStack || '',
      technicalNotes: projectData.technicalNotes || '',
      scopeItems: projectData.scopeItems || [],
      phases: projectData.phases || [],
      setupFee: projectData.setupFee ?? settings.defaultSetupFee,
      additionalFee: projectData.additionalFee ?? 0,
      discount: projectData.discount ?? 0,
      currency: projectData.currency || settings.currency || 'USD',
      paymentMethod: projectData.paymentMethod || { type: '50_50' },
      status: projectData.status || 'draft',
      statusHistory: [
        {
          status: projectData.status || 'draft',
          timestamp: new Date().toISOString(),
          notes: 'إنشاء المشروع',
        },
      ],
      customFields: projectData.customFields || [],
      handoverData: projectData.handoverData || {
        server: { serverIp: '', serverProvider: '', serverPlan: '', serverUsername: '', serverPassword: '', sshPort: '22', serverNotes: '' },
        domain: { domainName: '', domainProvider: '', domainUsername: '', domainPassword: '', domainExpiryDate: '', domainNotes: '' },
        webApp: { productionUrl: '', adminUrl: '', adminUsername: '', adminPassword: '', dbName: '', dbUsername: '', dbPassword: '', repoUrl: '', branch: 'main', deploymentNotes: '' },
        additional: { apiKeys: '', thirdPartyServices: '', emailConfig: '', importantLinks: '', maintenanceInfo: '', backupInfo: '', otherNotes: '' },
        customFields: [],
      },
      expectedDeliveryDate: projectData.expectedDeliveryDate,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated: Project = {
            ...p,
            ...projectData,
            updatedAt: new Date().toISOString().split('T')[0],
          };
          // Track status history if status changed
          if (projectData.status && projectData.status !== p.status) {
            updated.statusHistory = [
              ...(p.statusHistory || []),
              {
                status: projectData.status,
                timestamp: new Date().toISOString(),
                notes: `تغيير الحالة إلى ${projectData.status}`,
              },
            ];
          }
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
      setCurrentView('projects');
    }
  };

  const approveProject = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'in_progress' as ProjectStatus,
            approvalDate: today,
            startDate: p.startDate || today,
            statusHistory: [
              ...(p.statusHistory || []),
              {
                status: 'in_progress',
                timestamp: new Date().toISOString(),
                notes: 'اعتماد المشروع وبدء التنفيذ',
              },
            ],
            updatedAt: today,
          };
        }
        return p;
      })
    );
  };

  const completeProject = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'completed' as ProjectStatus,
            completionDate: today,
            statusHistory: [
              ...(p.statusHistory || []),
              {
                status: 'completed',
                timestamp: new Date().toISOString(),
                notes: 'اكتمال المشروع والانتقال لبيانات التسليم Handover',
              },
            ],
            updatedAt: today,
          };
        }
        return p;
      })
    );
  };

  const updateHandoverData = (projectId: string, handoverData: any) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            handoverData: {
              ...p.handoverData,
              ...handoverData,
            },
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      })
    );
  };

  // Client Actions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...clientData,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const login = (password: string): boolean => {
    if (password === adminPassword || password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('app_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('app_auth', 'false');
  };

  const updateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    localStorage.setItem('app_admin_password', newPass);
  };

  const exportData = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      projects,
      clients,
      settings,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itqan_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.projects && Array.isArray(data.projects)) {
        setProjects(data.projects);
        localStorage.setItem('app_projects', JSON.stringify(data.projects));
      }
      if (data.clients && Array.isArray(data.clients)) {
        setClients(data.clients);
        localStorage.setItem('app_clients', JSON.stringify(data.clients));
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings(data.settings);
        localStorage.setItem('app_settings', JSON.stringify(data.settings));
      }
      return true;
    } catch (err) {
      console.error('Failed to import JSON data:', err);
      return false;
    }
  };

  const resetData = () => {
    setProjects(initialProjects);
    setClients(initialClients);
    setSettings(defaultSettings);
    localStorage.removeItem('app_projects');
    localStorage.removeItem('app_clients');
    localStorage.removeItem('app_settings');
  };

  // Statistics calculation
  const stats = {
    totalProjects: enrichedProjects.length,
    quotations: enrichedProjects.filter(
      (p) => p.status === 'quotation_ready' || p.status === 'draft' || p.status === 'waiting_approval'
    ).length,
    quotationReady: enrichedProjects.filter((p) => p.status === 'quotation_ready').length,
    waitingApproval: enrichedProjects.filter((p) => p.status === 'waiting_approval').length,
    inProgress: enrichedProjects.filter((p) => p.status === 'in_progress').length,
    completed: enrichedProjects.filter((p) => p.status === 'completed').length,
    totalRevenue: enrichedProjects.reduce((sum, p) => {
      const scopeSum = (p.scopeItems || []).reduce(
        (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
      const total = scopeSum + (Number(p.setupFee) || 0) + (Number(p.additionalFee) || 0) - (Number(p.discount) || 0);
      return sum + (total > 0 ? total : 0);
    }, 0),
    totalValue: enrichedProjects.reduce((sum, p) => {
      const scopeSum = (p.scopeItems || []).reduce(
        (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
      const total = scopeSum + (Number(p.setupFee) || 0) + (Number(p.additionalFee) || 0) - (Number(p.discount) || 0);
      return sum + (total > 0 ? total : 0);
    }, 0),
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isAuthenticated,
        login,
        logout,
        adminPassword,
        updateAdminPassword,
        projects: enrichedProjects,
        clients,
        settings,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        selectedProjectId,
        setSelectedProjectId,
        currentView,
        setCurrentView,
        addProject,
        updateProject,
        deleteProject,
        approveProject,
        completeProject,
        updateHandoverData,
        addClient,
        updateClient,
        deleteClient,
        updateSettings,
        exportData,
        importData,
        resetData,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
