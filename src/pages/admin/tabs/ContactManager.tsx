import React, { useEffect, useState } from 'react';
import {
  Search, RefreshCw, MessageSquare, Mail, Phone,
  ChevronDown, StickyNote, Trash2, Save
} from 'lucide-react';
import { contactApi } from '../../../api/client';
import Pagination, { PAGE_SIZE } from '../../../components/ui/Pagination';

type ContactStatus = 'all' | 'new' | 'contacted' | 'enrolled' | 'closed';

interface ContactSubmission {
  id: number;
  name: string;
  phone: string;
  email: string;
  course: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'enrolled' | 'closed';
  admin_note: string | null;
  submitted_at: string;
  updated_at: string;
}

interface ContactStats {
  new: number;
  contacted: number;
  enrolled: number;
  closed: number;
  total: number;
}

const statusConfig: Record<ContactSubmission['status'], { label: string; cls: string; dot: string }> = {
  new:       { label: 'New',       cls: 'bg-blue-50 text-blue-600 border-blue-200',         dot: 'bg-blue-500'    },
  contacted: { label: 'Contacted', cls: 'bg-amber-50 text-amber-600 border-amber-200',       dot: 'bg-amber-400'   },
  enrolled:  { label: 'Enrolled',  cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  closed:    { label: 'Closed',    cls: 'bg-gray-100 text-gray-500 border-gray-200',         dot: 'bg-gray-400'    },
};

const filterTabs: { key: ContactStatus; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'new',       label: 'New'       },
  { key: 'contacted', label: 'Contacted' },
  { key: 'enrolled',  label: 'Enrolled'  },
  { key: 'closed',    label: 'Closed'    },
];

const ContactManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [stats, setStats]             = useState<ContactStats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<ContactStatus>('all');
  const [search, setSearch]           = useState('');
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [noteMap, setNoteMap]         = useState<Record<number, string>>({});
  const [savingNote, setSavingNote]   = useState<number | null>(null);
  const [page, setPage]               = useState(1);

  const load = async (currentFilter: ContactStatus = 'all', currentSearch = '') => {
    setLoading(true);
    try {
      const [subData, statData] = await Promise.all([
        contactApi.getAll({
          status: currentFilter !== 'all' ? currentFilter : undefined,
          search: currentSearch.trim() || undefined,
        }),
        contactApi.getStats(),
      ]);
      setSubmissions(subData.submissions || []);
      setStats(statData.stats || null);
      setPage(1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load('all', ''); }, []);

  const handleFilterChange = (f: ContactStatus) => { setFilter(f); load(f, search); };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value; setSearch(val); load(filter, val); };
  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); load(filter, search); };
  const updateStatus = async (id: number, status: ContactSubmission['status']) => { await contactApi.updateStatus(id, { status }); load(filter, search); };

  const saveNote = async (id: number) => {
    setSavingNote(id);
    await contactApi.updateStatus(id, { admin_note: noteMap[id] ?? '' });
    setSavingNote(null);
    load(filter, search);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete submission from ${name}?`)) return;
    await contactApi.remove(id);
    load(filter, search);
  };

  const pagedSubmissions = submissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['new', 'contacted', 'enrolled', 'closed'] as const).map(s => {
            const cfg = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                className={`rounded-2xl p-4 text-left border transition-all ${filter === s ? cfg.cls + ' shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
              >
                <p className="text-2xl font-bold text-gray-900">{stats[s]}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5 capitalize">{s}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Contact Submissions</h2>
            <p className="text-xs text-gray-400">{submissions.length} result{submissions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search name, email, phone..."
                className="pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-sky-400 w-52 bg-gray-50"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(''); load(filter, ''); }} className="absolute right-2 text-gray-300 hover:text-gray-500 text-sm leading-none">✕</button>
              )}
            </form>
            <div className="flex gap-1 flex-wrap">
              {filterTabs.map(t => (
                <button key={t.key} onClick={() => handleFilterChange(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === t.key ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={() => load(filter, search)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold px-3 py-2 rounded-xl">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">{search ? `No results for "${search}"` : `No ${filter !== 'all' ? filter : ''} submissions`}</p>
            {search && <button onClick={() => { setSearch(''); load(filter, ''); }} className="text-xs text-sky-500 underline mt-2">Clear search</button>}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {pagedSubmissions.map((s, idx) => {
                const cfg = statusConfig[s.status];
                const isExpanded = expandedId === s.id;
                const noteVal = noteMap[s.id] ?? (s.admin_note || '');

                return (
                  <div key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <div className="px-6 py-4 flex items-start gap-4">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-300 w-5 text-right">{(page - 1) * PAGE_SIZE + idx + 1}</span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.name?.charAt(0)?.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <p className="text-[10px] text-gray-400 truncate">{s.email}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <p className="text-[10px] text-gray-400">{s.phone}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {s.course || <span className="text-gray-300 italic">No course selected</span>}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(s.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex items-start justify-end gap-2 flex-wrap">
                          <div className="relative">
                            <select value={s.status} onChange={e => updateStatus(s.id, e.target.value as ContactSubmission['status'])}
                              className={`appearance-none text-[10px] font-bold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer outline-none ${cfg.cls}`}>
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="enrolled">Enrolled</option>
                              <option value="closed">Closed</option>
                            </select>
                            <ChevronDown className="w-2.5 h-2.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => { setExpandedId(isExpanded ? null : s.id); if (!isExpanded) setNoteMap(p => ({ ...p, [s.id]: s.admin_note || '' })); }}
                            className={`p-1.5 rounded-lg border transition-colors ${s.admin_note ? 'text-amber-500 bg-amber-50 border-amber-200' : 'text-gray-400 bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                            title="Admin note"
                          >
                            <StickyNote className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(s.id, s.name)}
                            className="p-1.5 text-red-400 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-5 ml-12 space-y-3">
                        {s.message && (
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Message</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{s.message}</p>
                          </div>
                        )}
                        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Admin Note</p>
                          <textarea
                            value={noteVal}
                            onChange={e => setNoteMap(p => ({ ...p, [s.id]: e.target.value }))}
                            rows={3}
                            placeholder="Add a private note about this lead..."
                            className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <button onClick={() => saveNote(s.id)} disabled={savingNote === s.id}
                              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                              <Save className="w-3 h-3" />
                              {savingNote === s.id ? 'Saving...' : 'Save Note'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Pagination total={submissions.length} page={page} onPage={p => setPage(p)} />
          </>
        )}
      </div>
    </div>
  );
};

export default ContactManager;