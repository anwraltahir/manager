import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  FileText,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { ConfirmModal } from '../common/ConfirmModal';

export const SettingsView: React.FC = () => {
  const { language, settings, updateSettings, exportData, importData, resetData } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  const [formData, setFormData] = useState<BusinessSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const success = importData(json);
        if (success) {
          alert(isRtl ? 'تم استيراد البيانات بنجاح!' : 'Data imported successfully!');
        } else {
          alert(isRtl ? 'فشل استيراد الملف، تحقق من صيغة JSON' : 'Failed to import data, invalid format');
        }
      } catch (err) {
        alert(isRtl ? 'خطأ أثناء قراءة الملف' : 'Error reading file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.settingsTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.settingsSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg transition-all shadow-md shadow-blue-200"
        >
          <Save className="w-4 h-4" />
          {t.saveSettings}
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {isRtl ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!'}
        </div>
      )}

      {/* Business Info Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            {t.businessInfo}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.companyNameArabic}</label>
              <input
                type="text"
                value={formData.companyNameAr || ''}
                onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.companyNameEnglish}</label>
              <input
                type="text"
                value={formData.companyNameEn || ''}
                onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.tagline}</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phoneNumber}</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.emailAddress}</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.website}</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.address}</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quotation & Financial Defaults */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <DollarSign className="w-4 h-4 text-blue-600" />
            {t.financialSection} & {t.tabDocuments}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.defaultCurrency}</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (ر.س)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="KWD">KWD (د.ك)</option>
                <option value="QAR">QAR (ر.ق)</option>
                <option value="EGP">EGP (ج.م)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setupFees} ({formData.currency})</label>
              <input
                type="number"
                value={formData.defaultSetupFee}
                onChange={(e) => setFormData({ ...formData, defaultSetupFee: Number(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.quotationValidityDays}</label>
              <input
                type="number"
                value={formData.defaultQuotationValidityDays}
                onChange={(e) => setFormData({ ...formData, defaultQuotationValidityDays: Number(e.target.value) || 15 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.defaultPaymentTerms}</label>
            <textarea
              rows={2}
              value={formData.defaultPaymentTerms || ''}
              onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.quotationNotes}</label>
            <textarea
              rows={2}
              value={formData.quotationNotes || ''}
              onChange={(e) => setFormData({ ...formData, quotationNotes: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </form>

      {/* Backup, Export & Reset Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Download className="w-4 h-4 text-blue-600" />
          {t.backupTitle}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportData}
            className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 bg-gray-50/50 hover:bg-blue-50/30 text-start transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <Download className="w-4 h-4 text-blue-600" />
              {t.exportJson}
            </div>
            <p className="text-[11px] text-slate-500">{t.exportJsonDesc}</p>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 bg-gray-50/50 hover:bg-blue-50/30 text-start transition-all space-y-1 cursor-pointer">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <Upload className="w-4 h-4 text-blue-600" />
              {t.importJson}
            </div>
            <p className="text-[11px] text-slate-500">{t.importJsonDesc}</p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="p-4 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50/30 hover:bg-rose-50/60 text-start transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
              <RefreshCw className="w-4 h-4 text-rose-600" />
              {t.resetDemoData}
            </div>
            <p className="text-[11px] text-rose-600/80">{t.resetDemoDataDesc}</p>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={resetData}
        title={t.resetDemoData}
        description={t.resetDemoDataDesc}
        variant="danger"
      />
    </div>
  );
};
