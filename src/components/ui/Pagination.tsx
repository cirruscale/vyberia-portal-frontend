interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-14">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="w-9 h-9 flex items-center justify-center text-[#7A7067] hover:text-[#2D6A4F] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-[#C8BFB3] text-[12px]">···</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 flex items-center justify-center text-[12px] tracking-[0.04em] transition-colors cursor-pointer ${
              p === page
                ? 'bg-[#0C0B0A] text-[#FAF9F7] font-medium'
                : 'text-[#7A7067] hover:text-[#2D6A4F] border border-transparent hover:border-[#E0D8CE]'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="w-9 h-9 flex items-center justify-center text-[#7A7067] hover:text-[#2D6A4F] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
