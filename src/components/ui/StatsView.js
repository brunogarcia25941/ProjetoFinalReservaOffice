import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';

function StatsView() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get(`/admin/stats`).then(res => res.data),
    refetchInterval: 30000 // Refresca a cada 30 segundos
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-500 font-medium">A carregar estatísticas...</span>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-admin-soft text-admin border border-admin-light p-6 rounded-xl text-center shadow-sm">
        <h3 className="text-lg font-bold">Erro ao carregar estatísticas de ocupação.</h3>
        <p className="text-sm text-gray-500 mt-1">Verifique a ligação ao servidor.</p>
      </div>
    );
  }

  const { totals, byResourceType, byOffice, byDayOfWeek, byStartHour, topResources } = stats;

  const maxDayCount = Math.max(...byDayOfWeek.map(d => d.count), 1);
  const maxHourCount = Math.max(...(byStartHour.map(h => h.count).concat([1])));

  // Mapeamento de cor e label para tipos de recurso
  const resourceTypeConfig = {
    desk: { label: 'Secretárias', color: 'bg-primary', text: 'text-primary' },
    room: { label: 'Salas', color: 'bg-success', text: 'text-success' },
    monitor: { label: 'Monitores Extras', color: 'bg-amber-500', text: 'text-amber-500' }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* 1. CARDS DE RESUMO (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Reservas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Total Reservas</span>
            <span className="text-3xl font-extrabold text-gray-900 block">{totals.totalBookings}</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-2 inline-block"></span>
            <span>Histórico total</span>
          </div>
        </div>

        {/* Reservas Ativas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Confirmadas (Ativas)</span>
            <span className="text-3xl font-extrabold text-blue-600 block">{totals.confirmed}</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 inline-block"></span>
            <span>A decorrer ou futuras</span>
          </div>
        </div>

        {/* Reservas Concluídas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Concluídas</span>
            <span className="text-3xl font-extrabold text-success block">{totals.completed}</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-success">
            <span className="w-2.5 h-2.5 rounded-full bg-success mr-2 inline-block"></span>
            <span>Finalizadas com sucesso</span>
          </div>
        </div>

        {/* Reservas Canceladas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Canceladas</span>
            <span className="text-3xl font-extrabold text-admin block">{totals.cancelled}</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-admin">
            <span className="w-2.5 h-2.5 rounded-full bg-admin mr-2 inline-block"></span>
            <span>Não usufruídas</span>
          </div>
        </div>

        {/* Duração Média */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Duração Média</span>
            <span className="text-3xl font-extrabold text-amber-600 block">{totals.avgDurationHours}h</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 inline-block"></span>
            <span>Por reserva ativa</span>
          </div>
        </div>
      </div>

      {/* 2. GRÁFICOS INTERMÉDIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Dia da Semana (Gráfico de Colunas) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Utilização por Dia da Semana
          </h3>
          <div className="flex justify-between items-end h-48 px-2 pt-4">
            {byDayOfWeek.map((dayData) => {
              const heightPercent = dayData.count > 0 ? (dayData.count / maxDayCount) * 90 : 2;
              return (
                <div key={dayData.day} className="flex flex-col items-center flex-1 group">
                  <div className="w-full flex justify-center mb-1">
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-6">
                      {dayData.count}
                    </span>
                  </div>
                  <div className="w-8 sm:w-10 bg-primary-soft hover:bg-primary rounded-t-md transition-all duration-300 relative" style={{ height: `${heightPercent}%` }}>
                    <div className="absolute inset-0 bg-primary rounded-t-md opacity-20 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 mt-2 block w-full text-center truncate">{dayData.day.substring(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ocupação por Tipo de Recurso (Gráfico de Barras Horizontais) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              Reservas por Tipo de Recurso
            </h3>
            <div className="space-y-5">
              {byResourceType.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">Sem dados de tipos de recurso.</p>
              ) : (
                byResourceType.map((item) => {
                  const total = byResourceType.reduce((sum, current) => sum + Number(current.count), 0);
                  const pct = total > 0 ? ((Number(item.count) / total) * 100).toFixed(0) : 0;
                  const config = resourceTypeConfig[item.resource_type] || { label: item.resource_type, color: 'bg-gray-500', text: 'text-gray-500' };

                  return (
                    <div key={item.resource_type} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${config.color}`}></span>
                          {config.label}
                        </span>
                        <span>{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className={`h-full ${config.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">
            * Exclui reservas canceladas
          </div>
        </div>
      </div>

      {/* 3. LISTAS DE DETALHE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Escritório */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-1">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Uso por Escritório
          </h3>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
            {byOffice.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Sem escritórios registados.</p>
            ) : (
              byOffice.map((off, idx) => {
                const totalOffs = byOffice.reduce((sum, curr) => sum + Number(curr.count), 0);
                const pctOff = totalOffs > 0 ? ((Number(off.count) / totalOffs) * 100).toFixed(0) : 0;
                return (
                  <div key={off.office_name} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm block">{off.office_name}</span>
                      <span className="text-xs text-gray-400">Posição #{idx + 1} no ranking</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-800 text-sm block">{off.count} res.</span>
                      <span className="text-xs font-semibold text-primary">{pctOff}% do uso</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top 5 Recursos mais Reservados */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-1">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.373-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            Ranking de Recursos
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {topResources.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Sem histórico de reservas.</p>
            ) : (
              topResources.map((res, idx) => {
                const config = resourceTypeConfig[res.resource_type] || { label: res.resource_type, color: 'bg-gray-500', text: 'text-gray-500' };
                return (
                  <div key={res.resource_name} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-between border border-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-800' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-gray-800 text-sm block">{res.resource_name}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <span className="bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-extrabold shadow-sm">
                      {res.count}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Picos de Ocupação por Hora (Horas mais Frequentes) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-1">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Picos de Ocupação (Hora)
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {byStartHour.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Sem histórico de horários.</p>
            ) : (
              // Filtrar horas normais de escritório (ex: 8h às 19h)
              byStartHour
                .filter(h => h.start_hour >= 7 && h.start_hour <= 20)
                .slice(0, 5) // Top 5 horas com mais movimento
                .map((hourRow) => {
                  const pctHour = maxHourCount > 0 ? ((hourRow.count / maxHourCount) * 100).toFixed(0) : 0;
                  const formatHour = `${String(hourRow.start_hour).padStart(2, '0')}:00`;

                  return (
                    <div key={hourRow.start_hour} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>{formatHour}</span>
                        <span>{hourRow.count} reservas</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pctHour}%` }}></div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsView;
