import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export { PAGE_SIZE };

const Pagination: React.FC<{
  total: number;
  page: number;
  pageSize?: number;
  onPage: (p: number) => void;
}> = ({ total, page, pageSize = PAGE_SIZE, onPage }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages: (number | '...')[] = [];
  pages.push(1);
  const left = page - 1;
  const right = page + 1;
  if (left > 2) pages.push('...');
  if (left >= 2) pages.push(left);
  if (page !== 1 && page !== totalPages) pages.push(page);
  if (right <= totalPages - 1) pages.push(right);
  if (right < totalPages - 1) pages.push('...');
  pages.push(totalPages);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-3">
      <p className="text-xs text-gray-400">
        Showing <span className="font-semibold text-gray-600">{start}–{end}</span> of{' '}
        <span className="font-semibold text-gray-600">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1.5 text-xs text-gray-300 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`min-w-[30px] h-[30px] rounded-lg text-xs font-semibold border transition-all
                ${page === p
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              aria-current={page === p ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;