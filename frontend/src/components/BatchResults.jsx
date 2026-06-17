const SEVERITY_COLORS = {
  none: 'text-green-400 bg-green-500/10 border-green-500/20',
  low: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  moderate: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const SEVERITY_DOT = {
  none: 'bg-green-400',
  low: 'bg-yellow-400',
  moderate: 'bg-orange-400',
  high: 'bg-red-400',
}

function MiniResultCard({ result, index, previewUrl }) {
  const sevColor = SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.moderate
  const dotColor = SEVERITY_DOT[result.severity] || SEVERITY_DOT.moderate

  if (result.error) {
    return (
      <div
        className="glass-card p-4 flex gap-4 animate-slide-up border-red-500/20"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {previewUrl && (
          <img src={previewUrl} alt={result.filename} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-white/10" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-400 truncate">{result.filename}</p>
          <p className="text-xs text-red-300/60 mt-1">{result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="glass-card p-4 hover:bg-white/[0.07] transition-all duration-200 animate-slide-up flex gap-4"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Thumbnail */}
      {previewUrl && (
        <div className="shrink-0">
          <img src={previewUrl} alt={result.filename} className="w-20 h-20 object-cover rounded-lg border border-white/10" />
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Header: filename + severity dot */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-gray-300 truncate flex-1 mr-2" title={result.filename}>
            {result.filename}
          </p>
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
        </div>

        {/* Prediction */}
        <p className="text-white font-semibold text-sm mb-2 truncate" title={result.predicted_label}>
          {result.predicted_label}
        </p>

        {/* Confidence bar & badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[80px]">
              <div
                className={`h-full rounded-full confidence-bar ${
                  result.is_healthy
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-orange-400 to-red-500'
                }`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-400">{result.confidence}%</span>
          </div>
          
          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${sevColor}`}>
            {result.is_healthy ? 'Saine' : result.predicted_class.replace('apple_', '').replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function BatchResults({ data, previews }) {
  const { results, summary } = data

  return (
    <div className="mt-10 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-white">{summary.total}</p>
          <p className="text-xs text-gray-400 mt-1">Images analysees</p>
        </div>
        <div className="glass-card p-5 text-center border-green-500/20">
          <p className="text-3xl font-bold text-green-400">{summary.healthy}</p>
          <p className="text-xs text-gray-400 mt-1">Feuilles saines</p>
        </div>
        <div className="glass-card p-5 text-center border-red-500/20">
          <p className="text-3xl font-bold text-red-400">{summary.diseased}</p>
          <p className="text-xs text-gray-400 mt-1">Feuilles malades</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-emerald-400">{summary.health_rate}%</p>
          <p className="text-xs text-gray-400 mt-1">Taux de sante</p>
        </div>
      </div>

      {/* Health rate bar */}
      <div className="glass-card p-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-300 font-medium">Taux de sante global</span>
          <span className="text-sm font-mono text-emerald-400">{summary.health_rate}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full confidence-bar bg-gradient-to-r from-green-400 to-emerald-500"
            style={{ width: `${summary.health_rate}%` }}
          />
        </div>
      </div>

      {/* Results grid */}
      <h3 className="text-lg font-semibold text-white mb-4">Resultats detailles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <MiniResultCard key={index} result={result} index={index} previewUrl={previews?.[result.filename]} />
        ))}
      </div>
    </div>
  )
}
