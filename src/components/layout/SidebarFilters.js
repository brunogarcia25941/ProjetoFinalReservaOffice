import React from 'react';

function SidebarFilters({
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
  atalhoAtivo,
  numHoras,
  setNumHoras,
  aplicarAtalho,
  setAtalhoAtivo,
  pisoFiltro,
  setPisoFiltro,
  pisosDisponiveis,
  tiposDisponiveis,
  tiposDesmarcados,
  setTiposDesmarcados,
  traduzirTipo
}) {
  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Configurar Reserva</h3>

        <div className="mb-5 bg-primary-soft/50 p-3 rounded-lg border border-primary-light">
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Horário</label>

          <div className="space-y-3 mt-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Início</label>
              <input
                type="datetime-local"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setAtalhoAtivo(null);
                }}
                className="w-full mt-1 border border-gray-300 rounded p-1.5 text-xs focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Fim</label>
              <input
                type="datetime-local"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setAtalhoAtivo(null);
                }}
                className="w-full mt-1 border border-gray-300 rounded p-1.5 text-xs focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-primary-light/60">
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block flex items-center justify-between">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Atalhos Rápidos
              </span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => aplicarAtalho('resto_hoje')}
                className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-all border ${atalhoAtivo === 'resto_hoje' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-primary-hover border-primary-light hover:bg-primary-soft'}`}
              >
                Resto de Hoje
              </button>

              <div className={`flex items-center border rounded-md transition-all ${atalhoAtivo === 'proximas_h' ? 'border-primary bg-primary' : 'border-primary-light bg-white'}`}>
                <input
                  type="number"
                  value={numHoras}
                  min="1"
                  max="9"
                  onChange={(e) => {
                    const novoValor = parseInt(e.target.value) || 1;
                    setNumHoras(novoValor);
                    if (atalhoAtivo === 'proximas_h') aplicarAtalho('proximas_h', novoValor);
                  }}
                  className={`w-8 text-center text-[10px] font-bold bg-transparent outline-none ${atalhoAtivo === 'proximas_h' ? 'text-white' : 'text-primary-hover'}`}
                />
                <button
                  onClick={() => aplicarAtalho('proximas_h')}
                  className={`text-[10px] font-bold px-2 py-1.5 rounded-r-md transition-all ${atalhoAtivo === 'proximas_h' ? 'text-white hover:bg-primary-hover' : 'text-primary-hover border-l border-primary-light hover:bg-primary-soft'}`}
                >
                  Próximas Horas
                </button>
              </div>

              <button
                onClick={() => aplicarAtalho('amanha')}
                className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-all border ${atalhoAtivo === 'amanha' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-primary-hover border-primary-light hover:bg-primary-soft'}`}
              >
                Amanhã
              </button>

              <button
                onClick={() => aplicarAtalho('semana')}
                className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-all border ${atalhoAtivo === 'semana' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-primary-hover border-primary-light hover:bg-primary-soft'}`}
              >
                Esta Semana
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-600 mb-2 block">LOCALIZAÇÃO (PISO)</label>
          <select
            value={pisoFiltro}
            onChange={(e) => setPisoFiltro(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary bg-gray-50 cursor-pointer"
          >
            <option value="">Todos os Pisos</option>
            {pisosDisponiveis.map((piso) => (
              <option key={piso} value={piso}>Piso {piso}</option>
            ))}
          </select>
        </div>

        {tiposDisponiveis.length > 0 && (
          <div className="mb-5 border-t border-gray-100 pt-5">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">TIPO DE RECURSO</label>
            <div className="space-y-2 text-sm text-gray-700">
              {tiposDisponiveis.map(tipo => (
                <label key={tipo} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={!tiposDesmarcados.includes(tipo)}
                    onChange={() => {
                      if (tiposDesmarcados.includes(tipo)) {
                        setTiposDesmarcados(prev => prev.filter(t => t !== tipo));
                      } else {
                        setTiposDesmarcados(prev => [...prev, tipo]);
                      }
                    }}
                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer border-gray-300"
                  />
                  <span className="capitalize">{traduzirTipo(tipo)}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default SidebarFilters;