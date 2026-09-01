import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { PasswordInput } from '../common/PasswordInput';

export const LoginScreen: React.FC = () => {
  const { language, login, settings } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError(isRtl ? 'يرجى إدخال كلمة المرور' : 'Please enter the password');
      return;
    }

    const success = login(password);
    if (!success) {
      setError(isRtl ? 'كلمة المرور غير صحيحة (الافتراضية: admin123)' : 'Incorrect password (default: admin123)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-xs rounded-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-200">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            {isRtl ? (settings.companyNameAr || 'إدارة أنور') : (settings.companyNameEn || 'Anwar Management')}
          </h1>
          <p className="text-xs text-slate-500">{t.loginSubtitle}</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <PasswordInput
              id="admin-password"
              label={t.password}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
            <span className="block text-[11px] text-slate-400 mt-1">
              {isRtl ? 'كلمة المرور الافتراضية: admin123' : 'Default password: admin123'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>{t.loginButton}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Administrative Security Layer Active
          </p>
        </div>
      </div>
    </div>
  );
};
