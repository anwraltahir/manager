export type Language = 'ar' | 'en';

export type ProjectStatus =
  | 'draft'              // مسودة
  | 'quotation_ready'    // عرض سعر جاهز
  | 'waiting_approval'   // بانتظار موافقة العميل
  | 'in_progress'        // معتمد / قيد التنفيذ
  | 'completed'          // مكتمل
  | 'cancelled';         // ملغي

export type ProjectType =
  | 'website'
  | 'webapp'
  | 'mobile'
  | 'ecommerce'
  | 'other';

export type CustomFieldType =
  | 'text'
  | 'longtext'
  | 'number'
  | 'currency'
  | 'date'
  | 'url'
  | 'email'
  | 'phone'
  | 'password'
  | 'dropdown'
  | 'checkbox'
  | 'file';

export interface CustomField {
  id: string;
  name: string;
  nameEn?: string;
  type: CustomFieldType;
  value: any;
  required: boolean;
  options?: string[]; // For dropdown
  includeInQuotation: boolean;
  includeInHandover: boolean;
  category?: 'general' | 'server' | 'domain' | 'credentials' | 'additional';
  order: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScopeItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  price: number;
  duration: string;
  notes: string;
  order: number;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  expectedStartDate: string;
  expectedEndDate: string;
  amountOrPercentage: string;
  notes: string;
  order: number;
}

export type PaymentMethodType = '50_50' | 'milestones' | 'full_upfront' | 'custom';

export interface PaymentMethod {
  type: PaymentMethodType;
  customText?: string;
}

export interface ServerInfo {
  serverIp: string;
  serverProvider: string;
  serverPlan: string;
  serverUsername: string;
  serverPassword: string;
  sshPort: string;
  serverNotes: string;
}

export interface DomainInfo {
  domainName: string;
  domainProvider: string;
  domainUsername: string;
  domainPassword: string;
  domainExpiryDate: string;
  domainNotes: string;
}

export interface WebAppInfo {
  productionUrl: string;
  adminUrl: string;
  adminUsername: string;
  adminPassword: string;
  dbName: string;
  dbUsername: string;
  dbPassword: string;
  repoUrl: string;
  branch: string;
  deploymentNotes: string;
}

export interface AdditionalHandoverInfo {
  apiKeys: string;
  thirdPartyServices: string;
  emailConfig: string;
  importantLinks: string;
  maintenanceInfo: string;
  backupInfo: string;
  otherNotes: string;
}

export interface HandoverData {
  server: ServerInfo;
  domain: DomainInfo;
  webApp: WebAppInfo;
  additional: AdditionalHandoverInfo;
  customFields: CustomField[];
  handoverCompletedDate?: string;
}

export interface StatusHistoryEntry {
  status: ProjectStatus;
  timestamp: string;
  notes?: string;
}

export interface Project {
  id: string;
  projectNumber: string;    // e.g. PRJ-2026-001
  quotationNumber: string;  // e.g. QT-2026-001
  name: string;
  type: ProjectType;
  customType?: string;
  clientId: string;
  client?: Client;
  description: string;
  idea: string;
  goals: string;
  targetAudience: string;
  techStack: string;
  technicalNotes: string;
  scopeItems: ScopeItem[];
  phases: ProjectPhase[];
  setupFee: number;
  additionalFee: number;
  discount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: ProjectStatus;
  statusHistory: StatusHistoryEntry[];
  customFields: CustomField[];
  handoverData: HandoverData;
  approvalDate?: string;
  startDate?: string;
  expectedDeliveryDate?: string;
  completionDate?: string;
  handoverDate?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  providerName: string;
  companyName: string;
  companyNameAr?: string;
  companyNameEn?: string;
  tagline?: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  currency: string;
  quotationValidityDays: number;
  defaultQuotationValidityDays?: number;
  defaultPaymentTerms: string;
  defaultTermsAndConditions: string;
  defaultSetupFee: number;
  quotationNotes?: string;
}

export type ViewMode =
  | 'dashboard'
  | 'projects'
  | 'clients'
  | 'quotations'
  | 'in_progress'
  | 'completed'
  | 'settings'
  | 'new_project'
  | 'edit_project'
  | 'project_details';

