import React, { useEffect, useState } from 'react';
import { HelpCircle, Save, Edit3, Trash2 } from 'lucide-react';
import { faqApi, Faq } from '../../../api/client';
import Pagination, { PAGE_SIZE } from '../../../components/ui/Pagination';

const FaqManager: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', sort_order: 0 });
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    const d = await faqApi.getAll();
    setFaqs(d.faqs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editing) { await faqApi.update(editing.id, form); }
    else { await faqApi.create(form); }
    setEditing(null);
    setForm({ question: '', answer: '', sort_order: 0 });
    load();
  };

  const startEdit = (f: Faq) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, sort_order: f.sort_order });
  };

  const pagedFaqs = faqs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">{editing ? 'Edit FAQ' : 'Add New FAQ'}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Question</label>
            <input
              value={form.question}
              onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
              placeholder="e.g. How do I access my course?"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Answer</label>
            <textarea
              value={form.answer}
              onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
              rows={3}
              placeholder="Write the answer..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: +e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-400"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> {editing ? 'Update' : 'Save FAQ'}
              </button>
              {editing && (
                <button
                  onClick={() => { setEditing(null); setForm({ question: '', answer: '', sort_order: 0 }); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">All FAQs</h3>
          <p className="text-xs text-gray-400">{faqs.length} question{faqs.length !== 1 ? 's' : ''}</p>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No FAQs yet</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {pagedFaqs.map((f, idx) => (
                <div key={f.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] bg-sky-50 text-sky-500 border border-sky-100 px-2 py-0.5 rounded-full font-bold">
                          #{(page - 1) * PAGE_SIZE + idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 truncate">{f.question}</p>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{f.answer}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => startEdit(f)}
                        className="p-1.5 text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => { if (confirm('Delete this FAQ?')) { await faqApi.delete(f.id); load(); } }}
                        className="p-1.5 text-red-400 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination total={faqs.length} page={page} onPage={p => setPage(p)} />
          </>
        )}
      </div>
    </div>
  );
};

export default FaqManager;