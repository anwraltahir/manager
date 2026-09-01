import React, { useState } from 'react';
import {
  Server,
  Globe,
  Layout,
  Key,
  ShieldCheck,
  FileDown,
  Save,
  CheckCircle2,
  Lock,
  ExternalLink,
  Plus,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Project, HandoverData, CustomField } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { PasswordInput } from '../common/PasswordInput';
import { CustomFieldsManager } from './CustomFieldsManager';
import { generateHandoverDocx } from '../../utils/docxGenerator';

interface HandoverSectionProps {
  project: Project;
}

export const HandoverSection: React.FC<HandoverSectionProps> = ({ project }) => {
  const { language, settings, updateHandoverData } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  const defaultHandover = project.handoverData || {
    server: { serverIp: '', serverProvider: '', serverPlan: '', serverUsername: '', serverPassword: '', sshPort: '22', serverNotes: '' },
    domain: { domainName: '', domainProvider: '', domainUsername: '', domainPassword: '', domainExpiryDate: '', domainNotes: '' },
    webApp: { productionUrl: '', adminUrl: '', adminUsername: '', adminPassword: '', dbName: '', dbUsername: '', dbPassword: '', repoUrl: '', branch: 'main', deploymentNotes: '' },
    additional: { apiKeys: '', thirdPartyServices: '', emailConfig: '', importantLinks: '', maintenanceInfo: '', backupInfo: '', otherNotes: '' },
    customFields: [],
  };

  const [server, setServer] = useState(defaultHandover.server || {});
  const [domain, setDomain] = useState(defaultHandover.domain || {});
  const [webApp, setWebApp] = useState(defaultHandover.webApp || {});
  const [additional, setAdditional] = useState(defaultHandover.additional || {});
  const [customFields, setCustomFields] = useState<CustomField[]>(defaultHandover.customFields || []);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (andGenerateDocx = false) => {
    const updatedHandover: HandoverData = {
      server,
      domain,
      webApp,
      additional,
      customFields,
      handoverCompletedDate: project.handoverDate || new Date().toISOString().split('T')[0],
    };

    updateHandoverData(project.id, updatedHandover);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    if (andGenerateDocx) {
      generateHandoverDocx({ ...project, handoverData: updatedHandover }, settings, language);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">{t.handoverHeader}</h3>
            <p className="text-xs text-emerald-700 mt-0.5">{t.handoverDesc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            {t.save}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-md shadow-emerald-200 active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4" />
            {t.generateHandoverDocx}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          {isRtl ? 'تم حفظ بيانات التسليم بنجاح!' : 'Handover information saved successfully!'}
        </div>
      )}

      {/* 1. Website & Application Credentials */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-600" />
            {t.webAppInfo}
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">App & Admin Access</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.productionUrl}</label>
            <div className="relative flex items-center">
              <input
                type="url"
                value={webApp.productionUrl || ''}
                onChange={(e) => setWebApp({ ...webApp, productionUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono pe-8"
              />
              {webApp.productionUrl && (
                <a
                  href={webApp.productionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute end-2 text-slate-400 hover:text-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.adminUrl}</label>
            <div className="relative flex items-center">
              <input
                type="url"
                value={webApp.adminUrl || ''}
                onChange={(e) => setWebApp({ ...webApp, adminUrl: e.target.value })}
                placeholder="https://example.com/admin"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono pe-8"
              />
              {webApp.adminUrl && (
                <a
                  href={webApp.adminUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute end-2 text-slate-400 hover:text-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.adminUsername}</label>
            <input
              type="text"
              value={webApp.adminUsername || ''}
              onChange={(e) => setWebApp({ ...webApp, adminUsername: e.target.value })}
              placeholder="admin"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <PasswordInput
              label={t.adminPassword}
              value={webApp.adminPassword || ''}
              onChange={(e) => setWebApp({ ...webApp, adminPassword: e.target.value })}
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.dbName}</label>
            <input
              type="text"
              value={webApp.dbName || ''}
              onChange={(e) => setWebApp({ ...webApp, dbName: e.target.value })}
              placeholder="app_production_db"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.dbUsername}</label>
            <input
              type="text"
              value={webApp.dbUsername || ''}
              onChange={(e) => setWebApp({ ...webApp, dbUsername: e.target.value })}
              placeholder="db_user"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <PasswordInput
              label={t.dbPassword}
              value={webApp.dbPassword || ''}
              onChange={(e) => setWebApp({ ...webApp, dbPassword: e.target.value })}
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.repoUrl}</label>
            <input
              type="url"
              value={webApp.repoUrl || ''}
              onChange={(e) => setWebApp({ ...webApp, repoUrl: e.target.value })}
              placeholder="https://github.com/org/repo"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.branch}</label>
            <input
              type="text"
              value={webApp.branch || 'main'}
              onChange={(e) => setWebApp({ ...webApp, branch: e.target.value })}
              placeholder="main"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.deploymentNotes}</label>
          <textarea
            rows={2}
            value={webApp.deploymentNotes || ''}
            onChange={(e) => setWebApp({ ...webApp, deploymentNotes: e.target.value })}
            placeholder="تعليمات التشغيل والنشر وأوامر Build / CI/CD..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* 2. Server & Hosting */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            {t.serverInfo}
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Infrastructure</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.serverIp}</label>
            <input
              type="text"
              value={server.serverIp || ''}
              onChange={(e) => setServer({ ...server, serverIp: e.target.value })}
              placeholder="192.168.1.1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.serverProvider}</label>
            <input
              type="text"
              value={server.serverProvider || ''}
              onChange={(e) => setServer({ ...server, serverProvider: e.target.value })}
              placeholder="AWS / DigitalOcean / Hetzner"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.serverPlan}</label>
            <input
              type="text"
              value={server.serverPlan || ''}
              onChange={(e) => setServer({ ...server, serverPlan: e.target.value })}
              placeholder="4GB RAM, 2 vCPU, 80GB SSD"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.serverUsername}</label>
            <input
              type="text"
              value={server.serverUsername || ''}
              onChange={(e) => setServer({ ...server, serverUsername: e.target.value })}
              placeholder="root / ubuntu"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <PasswordInput
              label={t.serverPassword}
              value={server.serverPassword || ''}
              onChange={(e) => setServer({ ...server, serverPassword: e.target.value })}
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.sshPort}</label>
            <input
              type="text"
              value={server.sshPort || '22'}
              onChange={(e) => setServer({ ...server, sshPort: e.target.value })}
              placeholder="22"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.serverNotes}</label>
          <input
            type="text"
            value={server.serverNotes || ''}
            onChange={(e) => setServer({ ...server, serverNotes: e.target.value })}
            placeholder="ملاحظات الحماية، الجدار الناري Firewall، مفاتيح SSH..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* 3. Domain & DNS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            {t.domainInfo}
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">DNS & Registrar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.domainName}</label>
            <input
              type="text"
              value={domain.domainName || ''}
              onChange={(e) => setDomain({ ...domain, domainName: e.target.value })}
              placeholder="example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.domainProvider}</label>
            <input
              type="text"
              value={domain.domainProvider || ''}
              onChange={(e) => setDomain({ ...domain, domainProvider: e.target.value })}
              placeholder="Namecheap / GoDaddy / Cloudflare"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.domainExpiryDate}</label>
            <input
              type="date"
              value={domain.domainExpiryDate || ''}
              onChange={(e) => setDomain({ ...domain, domainExpiryDate: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.domainUsername}</label>
            <input
              type="text"
              value={domain.domainUsername || ''}
              onChange={(e) => setDomain({ ...domain, domainUsername: e.target.value })}
              placeholder="registrar_user"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <PasswordInput
              label={t.domainPassword}
              value={domain.domainPassword || ''}
              onChange={(e) => setDomain({ ...domain, domainPassword: e.target.value })}
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.domainNotes}</label>
            <input
              type="text"
              value={domain.domainNotes || ''}
              onChange={(e) => setDomain({ ...domain, domainNotes: e.target.value })}
              placeholder="سجلات DNS، Cloudflare Nameservers..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Handover Custom Fields (e.g. Cloudflare, Apple Dev, Firebase, etc.) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
        <CustomFieldsManager
          fields={customFields}
          onChange={setCustomFields}
          title={t.handoverCustomFields}
          description={
            isRtl
              ? 'أضف أي حسابات إضافية لتسليمها للعميل في ملف الـ Word (مثل Cloudflare Account, Stripe Keys, Firebase ID, Apple Dev Account)'
              : 'Add any custom accounts or keys to include in the generated Handover Word doc'
          }
          defaultIncludeInHandover={true}
          defaultIncludeInQuotation={false}
          category="credentials"
        />
      </div>

      {/* 5. Additional Technical Information */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Key className="w-4 h-4 text-blue-600" />
          {t.additionalInfo}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.apiKeys}</label>
            <textarea
              rows={2}
              value={additional.apiKeys || ''}
              onChange={(e) => setAdditional({ ...additional, apiKeys: e.target.value })}
              placeholder="Google Maps API Key, OpenAI Key, Stripe Live Keys..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.thirdPartyServices}</label>
            <textarea
              rows={2}
              value={additional.thirdPartyServices || ''}
              onChange={(e) => setAdditional({ ...additional, thirdPartyServices: e.target.value })}
              placeholder="SendGrid, OneSignal, Sentry, Cloudinary, Tap Payments..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.emailConfig}</label>
            <input
              type="text"
              value={additional.emailConfig || ''}
              onChange={(e) => setAdditional({ ...additional, emailConfig: e.target.value })}
              placeholder="smtp.example.com:587 | user: info@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.importantLinks}</label>
            <input
              type="text"
              value={additional.importantLinks || ''}
              onChange={(e) => setAdditional({ ...additional, importantLinks: e.target.value })}
              placeholder="روابط التوثيق، لوحات المراقبة، الـ Figma النهائي..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.backupInfo}</label>
            <input
              type="text"
              value={additional.backupInfo || ''}
              onChange={(e) => setAdditional({ ...additional, backupInfo: e.target.value })}
              placeholder="النسخ الاحتياطي اليومي عبر AWS S3، التوقيت، أوامر الاسترجاع..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.maintenanceInfo}</label>
            <input
              type="text"
              value={additional.maintenanceInfo || ''}
              onChange={(e) => setAdditional({ ...additional, maintenanceInfo: e.target.value })}
              placeholder="فترة الضمان والدعم الفني، قنوات التواصل للطوارئ..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.otherNotes}</label>
          <textarea
            rows={2}
            value={additional.otherNotes || ''}
            onChange={(e) => setAdditional({ ...additional, otherNotes: e.target.value })}
            placeholder="أي تفاصيل أو إرشادات خاصة للعميل قبل استلام المشروع..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-end gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
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
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-200 transition-all active:scale-[0.98]"
        >
          <FileDown className="w-4 h-4" />
          {t.generateHandoverDocx}
        </button>
      </div>
    </div>
  );
};
