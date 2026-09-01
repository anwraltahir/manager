import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  FolderKanban,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Client } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { ConfirmModal } from '../common/ConfirmModal';

interface ClientsViewProps {
  onSelectProject: (id: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onSelectProject }) => {
  const { language, clients, projects, addClient, updateClient, deleteClient } = useApp();
  const t = useTranslation(language);
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(isRtl ? 'المملكة العربية السعودية' : 'Saudi Arabia');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setCountry(isRtl ? 'المملكة العربية السعودية' : 'Saudi Arabia');
    setAddress('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompany(client.company || '');
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setCountry(client.country || '');
    setAddress(client.address || '');
    setNotes(client.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        name: name.trim(),
        company: company.trim(),
        phone: phone.trim(),
        email: email.trim(),
        country: country.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
    } else {
      addClient({
        name: name.trim(),
        company: company.trim(),
        phone: phone.trim(),
        email: email.trim(),
        country: country.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter((p) => p.clientId === clientId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.clientsTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.clientsSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg transition-all shadow-md shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          {t.addClient}
        </button>
      </div>

      {/* Clients Card (High-Density rounded-2xl Container) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchClients}
              className="w-full rounded-lg bg-gray-100 border-transparent py-1.5 ps-8 pe-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono bg-gray-100 px-2.5 py-1 rounded-full">
            {filteredClients.length} {isRtl ? 'عميل' : 'clients'}
          </span>
        </div>

        {/* Clients Table */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600">{t.noClientsFound}</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-start border-collapse">
              <thead className="bg-gray-50 text-slate-500 text-xs uppercase sticky top-0 z-10 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.clientName}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.companyName}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.phoneNumber}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.emailAddress}</th>
                  <th className="px-5 py-3.5 font-semibold text-start">{t.country}</th>
                  <th className="px-5 py-3.5 font-semibold text-center">{t.totalProjects}</th>
                  <th className="px-5 py-3.5 font-semibold text-end">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredClients.map((client) => {
                  const clientProjects = getClientProjects(client.id);

                  return (
                    <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                        {client.name}
                      </td>

                      <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                        {client.company || '-'}
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-700 whitespace-nowrap">
                        {client.phone || '-'}
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-700 whitespace-nowrap">
                        {client.email || '-'}
                      </td>

                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {client.country || '-'}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700">
                          {clientProjects.length}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(client)}
                            title={t.edit}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteClientId(client.id)}
                            title={t.delete}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingClient ? t.editClient : t.addClient}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.clientName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.companyName}</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phoneNumber}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.emailAddress}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.country}</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.address}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientNotes}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 transition-all"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete client modal */}
      <ConfirmModal
        isOpen={Boolean(deleteClientId)}
        onClose={() => setDeleteClientId(null)}
        onConfirm={() => {
          if (deleteClientId) deleteClient(deleteClientId);
        }}
        title={t.confirmDeleteTitle}
        description={t.confirmDeleteDesc}
        variant="danger"
      />
    </div>
  );
};
