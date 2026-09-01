import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileText,
  Key,
  Calendar,
  Link,
  Mail,
  Phone,
  DollarSign,
  List,
  CheckSquare,
  FileCode,
  File,
  Eye,
  EyeOff,
  Settings2,
} from 'lucide-react';
import { CustomField, CustomFieldType } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { ConfirmModal } from '../common/ConfirmModal';

interface CustomFieldsManagerProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  title?: string;
  description?: string;
  defaultIncludeInQuotation?: boolean;
  defaultIncludeInHandover?: boolean;
  category?: 'general' | 'server' | 'domain' | 'credentials' | 'additional';
}

export const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({
  fields,
  onChange,
  title,
  description,
  defaultIncludeInQuotation = false,
  defaultIncludeInHandover = false,
  category = 'general',
}) => {
  const { language } = useApp();
  const t = useTranslation(language);

  const [isAddingField, setIsAddingField] = useState(false);
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null);

  // New field modal/form state
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newIncludeInQuotation, setNewIncludeInQuotation] = useState(defaultIncludeInQuotation);
  const [newIncludeInHandover, setNewIncludeInHandover] = useState(defaultIncludeInHandover);

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) return;

    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      value: newFieldType === 'checkbox' ? false : '',
      required: newFieldRequired,
      options:
        newFieldType === 'dropdown'
          ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
          : undefined,
      includeInQuotation: newIncludeInQuotation,
      includeInHandover: newIncludeInHandover,
      category: category as 'general' | 'server' | 'domain' | 'credentials' | 'additional',
      order: fields.length + 1,
    };

    onChange([...fields, newField]);
    setIsAddingField(false);
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    setNewIncludeInQuotation(defaultIncludeInQuotation);
    setNewIncludeInHandover(defaultIncludeInHandover);
  };

  const handleFieldValueChange = (id: string, value: any) => {
    onChange(
      fields.map((f) => (f.id === id ? { ...f, value } : f))
    );
  };

  const handleFieldPropertyChange = (id: string, updates: Partial<CustomField>) => {
    onChange(
      fields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleDeleteField = () => {
    if (!deleteFieldId) return;
    onChange(fields.filter((f) => f.id !== deleteFieldId));
    setDeleteFieldId(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    onChange(newFields);
  };

  const renderFieldInput = (field: CustomField) => {
    switch (field.type) {
      case 'longtext':
        return (
          <textarea
            rows={2}
            value={field.value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={field.name}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        );
      case 'password':
        return (
          <div className="relative flex items-center">
            <input
              type={visiblePasswords[field.id] ? 'text' : 'password'}
              value={field.value || ''}
              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pe-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(field.id)}
              className="absolute end-2 text-slate-400 hover:text-slate-700 p-1"
            >
              {visiblePasswords[field.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        );
      case 'checkbox':
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => handleFieldValueChange(field.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700">{field.value ? 'مفعل (Enabled)' : 'غير مفعل (Disabled)'}</span>
          </label>
        );
      case 'dropdown':
        return (
          <select
            value={field.value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">-- {t.view} --</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={field.value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={field.value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        );
      case 'url':
        return (
          <input
            type="url"
            value={field.value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        );
      default:
        return (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={field.name}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        );
    }
  };

  const getFieldTypeIcon = (type: CustomFieldType) => {
    switch (type) {
      case 'password':
        return <Key className="w-3.5 h-3.5 text-amber-600" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-sky-600" />;
      case 'url':
        return <Link className="w-3.5 h-3.5 text-blue-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-teal-600" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'currency':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case 'dropdown':
        return <List className="w-3.5 h-3.5 text-purple-600" />;
      case 'checkbox':
        return <CheckSquare className="w-3.5 h-3.5 text-blue-600" />;
      case 'file':
        return <File className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-600" />
            {title || t.customFieldsSection}
          </h4>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsAddingField(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.addCustomField}
        </button>
      </div>

      {/* Add Field Inline Form */}
      {isAddingField && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-900">{t.addCustomField}</h5>
            <button
              type="button"
              onClick={() => setIsAddingField(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              {t.cancel}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t.fieldName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Firebase Project ID / Figma URL"
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t.fieldType}
              </label>
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as CustomFieldType)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="text">{t.type_text}</option>
                <option value="longtext">{t.type_longtext}</option>
                <option value="number">{t.type_number}</option>
                <option value="currency">{t.type_currency}</option>
                <option value="date">{t.type_date}</option>
                <option value="url">{t.type_url}</option>
                <option value="email">{t.type_email}</option>
                <option value="phone">{t.type_phone}</option>
                <option value="password">{t.type_password}</option>
                <option value="dropdown">{t.type_dropdown}</option>
                <option value="checkbox">{t.type_checkbox}</option>
                <option value="file">{t.type_file}</option>
              </select>
            </div>

            {newFieldType === 'dropdown' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.fieldOptions}
                </label>
                <input
                  type="text"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="Option 1, Option 2, Option 3"
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newIncludeInQuotation}
                onChange={(e) => setNewIncludeInQuotation(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {t.fieldIncludeInQuotation}
            </label>

            <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newIncludeInHandover}
                onChange={(e) => setNewIncludeInHandover(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {t.fieldIncludeInHandover}
            </label>

            <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newFieldRequired}
                onChange={(e) => setNewFieldRequired(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {t.fieldRequired}
            </label>

            <div className="ms-auto">
              <button
                type="button"
                onClick={handleAddField}
                disabled={!newFieldName.trim()}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-all shadow-md shadow-blue-200 active:scale-[0.98]"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field List */}
      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <p className="text-xs text-slate-500">
            لا توجد حقول مخصصة حالياً. اضغط على "+ {t.addCustomField}" لإضافة أي بيانات خاصة بهذا المشروع.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-gray-100">{getFieldTypeIcon(field.type)}</span>
                  <span className="text-xs font-bold text-slate-900">{field.name}</span>
                  {field.required && (
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {t.requiredBadge}
                    </span>
                  )}
                  {field.includeInQuotation && (
                    <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Word Quotation
                    </span>
                  )}
                  {field.includeInHandover && (
                    <span className="text-[10px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Word Handover
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    title={t.moveUp}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === fields.length - 1}
                    title={t.moveDown}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteFieldId(field.id)}
                    title={t.deleteField}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Input for the field */}
              <div className="mt-1">{renderFieldInput(field)}</div>

              {/* Toggles bar */}
              <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-gray-100 text-[11px] text-slate-500">
                <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={field.includeInQuotation}
                    onChange={(e) =>
                      handleFieldPropertyChange(field.id, {
                        includeInQuotation: e.target.checked,
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>تضمين في عرض السعر</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={field.includeInHandover}
                    onChange={(e) =>
                      handleFieldPropertyChange(field.id, {
                        includeInHandover: e.target.checked,
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>تضمين في ملف التسليم</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(deleteFieldId)}
        onClose={() => setDeleteFieldId(null)}
        onConfirm={handleDeleteField}
        title={t.confirmDeleteFieldTitle}
        description={t.confirmDeleteFieldDesc}
        variant="danger"
      />
    </div>
  );
};
