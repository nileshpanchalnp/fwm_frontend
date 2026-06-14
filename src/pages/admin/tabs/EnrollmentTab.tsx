import React, { useEffect, useState } from 'react';
import {
  Search, RefreshCw, Inbox, CheckCircle2, Trash2,
  FileSpreadsheet, Calendar, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { adminApi, EnrollmentAdmin } from '../../../api/client';
import Pagination, { PAGE_SIZE } from '../../../components/ui/Pagination';

type EnrollmentFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface EnrollmentTabProps {
  onStatsRefresh: () => void;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending:  'bg-amber-50 text-amber-600 border border-amber-200',
    approved: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    rejected: 'bg-red-50 text-red-500 border border-red-200',
  };
  return `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${map[status] || ''}`;
};

const statusDot = (status: string) => {
  const map: Record<string, string> = {
    pending:  'bg-amber-400',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-400',
  };
  return `w-1.5 h-1.5 rounded-full ${map[status] || 'bg-gray-400'}`;
};

const EnrollmentTab: React.FC<EnrollmentTabProps> = ({ onStatsRefresh }) => {
  const [enrollments, setEnrollments] = useState<EnrollmentAdmin[]>([]);
  const [loading, setLoading]         = useState(false);
  const [filter, setFilter]           = useState<EnrollmentFilter>('all');
  const [search, setSearch]           = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [page, setPage]               = useState(1);
  const [exporting, setExporting]     = useState(false);

  const fetchEnrollments = async (f: EnrollmentFilter = filter) => {
    setLoading(true);
    const d = await adminApi.getEnrollments(f === 'all' ? undefined : f);
    setEnrollments(d.enrollments);
    setLoading(false);
  };

  useEffect(() => { fetchEnrollments(); setPage(1); }, [filter]);

  const handleApprove = async (id: number) => {
    await adminApi.approve(id);
    fetchEnrollments();
    onStatsRefresh();
  };

  const handleReject = async (id: number, name: string) => {
    if (!window.confirm(`Reject ${name}?`)) return;
    await adminApi.reject(id);
    fetchEnrollments();
    onStatsRefresh();
  };

  // ── Filtering ───────────────────────────────────────────────────
  const filtered = enrollments.filter(e => {
    const matchSearch = !search ||
      e.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.user_email?.toLowerCase().includes(search.toLowerCase());

    const enrolledDate = new Date(e.enrolled_at);
    const matchFrom = !dateFrom || enrolledDate >= new Date(dateFrom);
    const matchTo   = !dateTo   || enrolledDate <= new Date(dateTo + 'T23:59:59');

    return matchSearch && matchFrom && matchTo;
  });

  const pagedEnrollments = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearDates = () => { setDateFrom(''); setDateTo(''); setPage(1); };

  // ── Excel Export ────────────────────────────────────────────────
  const exportToExcel = async () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // ── Build sheet with 3 header rows then data ──────────────
      // Row 1: Title, Row 2: Generated, Row 3: Filter info, Row 4: blank, Row 5+: data
      const headerRows = [
        ['Enrollment Report'],
        [`Generated: ${new Date().toLocaleString('en-GB')}`],
        [`Filter: ${filter.toUpperCase()}  |  Date range: ${dateFrom || 'Any'} → ${dateTo || 'Any'}  |  Total rows: ${filtered.length}`],
        [], // blank spacer row
      ];

      // Column headers row
      const colHeaders = ['#', 'Student Name', 'Email', 'Course', 'Transaction ID', 'Status', 'Enrolled Date', 'Expiry Date', 'Expired?'];

      // Data rows as arrays (same order as colHeaders)
      const dataRows = filtered.map((e, i) => [
        i + 1,
        e.user_name || '',
        e.user_email || '',
        e.course_title || '',
        e.transaction_id || '',
        e.status.charAt(0).toUpperCase() + e.status.slice(1),
        new Date(e.enrolled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        e.expires_at
          ? new Date(e.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Pending',
        e.expires_at && new Date(e.expires_at) < new Date() ? 'Yes' : 'No',
      ]);

      const ws = XLSX.utils.aoa_to_sheet([
        ...headerRows,
        colHeaders,
        ...dataRows,
      ]);

      // Column widths
      ws['!cols'] = [
        { wch: 5 }, { wch: 24 }, { wch: 30 }, { wch: 16 }, { wch: 28 },
        { wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 10 },
      ];

      // Enrollments sheet goes first → Excel opens it by default
      XLSX.utils.book_append_sheet(wb, ws, 'Enrollments');

      const fileName = `enrollments_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Export failed', err);
    }
    setExporting(false);
  };

  const hasDateFilter = dateFrom || dateTo;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-gray-900 text-sm">Enrollment Requests</h2>
          <p className="text-xs text-gray-400">{filtered.length} enrollment{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email..."
              className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-sky-400 w-48 bg-gray-50"
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                title="From date"
                className="pl-8 pr-2 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-sky-400 bg-gray-50 w-36"
              />
            </div>
            <span className="text-xs text-gray-400">→</span>
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                title="To date"
                className="pl-8 pr-2 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-sky-400 bg-gray-50 w-36"
              />
            </div>
            {hasDateFilter && (
              <button
                onClick={clearDates}
                title="Clear date filter"
                className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                  ${filter === f ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Excel Export */}
          <button
            onClick={exportToExcel}
            disabled={exporting || filtered.length === 0}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchEnrollments()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold px-3 py-2 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active date filter badge */}
      {hasDateFilter && (
        <div className="px-6 py-2 bg-sky-50 border-b border-sky-100 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-sky-500" />
          <p className="text-xs text-sky-700 font-semibold">
            Date filter active: {dateFrom || '∞'} → {dateTo || '∞'}
            <span className="ml-2 text-sky-500 font-normal">({filtered.length} result{filtered.length !== 1 ? 's' : ''})</span>
          </p>
          <button onClick={clearDates} className="ml-auto text-xs text-sky-500 hover:text-sky-700 underline">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">No {filter} enrollments{hasDateFilter ? ' in selected date range' : ''}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['#', 'Contact', 'Course', 'Transaction', 'Status', 'Enrolled', 'Expiry', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 first:px-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedEnrollments.map((e, idx) => {
                  const isExpired = e.expires_at && new Date(e.expires_at) < new Date();
                  return (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {e.user_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-[120px]">
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{e.user_name}</p>
                            <p className="text-[10px] text-gray-400">{e.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><p className="text-xs font-medium text-gray-700 max-w-[140px] truncate">{e.course_title}</p></td>
                      <td className="px-4 py-4"><p className="text-[13px] font-mono text-gray-500">{e.transaction_id || '—'}</p></td>
                      <td className="px-4 py-4">
                        <span className={statusBadge(e.status)}>
                          <span className={statusDot(e.status)} />
                          {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[10px] text-gray-400">
                          {new Date(e.enrolled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {e.expires_at ? (
                          <p className={`text-[10px] font-bold ${isExpired ? 'text-red-500' : 'text-emerald-600'}`}>
                            {new Date(e.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        ) : <p className="text-[10px] text-gray-300">Pending</p>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {e.status !== 'approved' && (
                            <button onClick={() => handleApprove(e.id)}
                              className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                          )}
                          {e.status !== 'rejected' && (
                            <button onClick={() => handleReject(e.id, e.user_name)}
                              className="p-1.5 text-red-400 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination total={filtered.length} page={page} onPage={p => setPage(p)} />
        </>
      )}
    </div>
  );
};

export default EnrollmentTab;