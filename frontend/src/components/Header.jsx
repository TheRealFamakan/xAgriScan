export default function Header() {
  return (
    <header className="text-center mb-12 animate-fade-in">
      {/* Logo / Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/25 mb-6">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 007.92 12.446A9 9 0 1112 2.992z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l-5 5m0 0l-3-3" />
        </svg>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-300 via-emerald-200 to-green-300 bg-clip-text text-transparent mb-3">
        xAgriScan
      </h1>
      <p className="text-gray-200 text-lg font-light max-w-xl mx-auto leading-relaxed bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
        Detection intelligente des maladies des feuilles de pommier par analyse d'image via ResNet-50
      </p>

      {/* Stats badges */}
      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm">
          6 pathologies detectees
        </span>
        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
          ResNet-50 Fine-tune
        </span>
        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30 backdrop-blur-sm">
          90.87% Accuracy
        </span>
      </div>
    </header>
  )
}