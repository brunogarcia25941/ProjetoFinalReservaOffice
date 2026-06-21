import React, { useState } from 'react';

const translateType = (type) => {
  const mapping = {
    desk: 'Mesa',
    room: 'Sala de Reunião',
    monitor: 'Monitor',
    mouse: 'Rato',
    keyboard: 'Teclado',
    headphones: 'Auscultadores',
    hdmi_cable: 'Cabo HDMI',
    network_cable: 'Cabo de Rede',
    webcam: 'Webcam',
    hdmi_vga_adapter: 'Adaptador HDMI para VGA',
    pc_charger: 'Carregador de PC'
  };
  return mapping[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : '');
};

function BookingTable({ bookings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Extract unique filter options dynamically from current bookings list
  const uniqueTypes = [...new Set(bookings.map((b) => b.resource_type).filter(Boolean))].sort();
  const uniqueStatuses = [...new Set(bookings.map((b) => b.status).filter(Boolean))].sort();

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter((reserva) => {
    // Search filter
    const matchesSearch =
      (reserva.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reserva.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reserva.resource_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !selectedStatus || reserva.status === selectedStatus;

    // Resource Type filter
    const matchesType = !selectedType || reserva.resource_type === selectedType;

    // Date filter (check if selected date overlaps with the booking duration)
    let matchesDate = true;
    if (selectedDate) {
      const bookingStart = new Date(reserva.start_time);
      const bookingEnd = new Date(reserva.end_time);

      // Start of selected date in local time
      const filterStart = new Date(`${selectedDate}T00:00:00`);
      // End of selected date in local time
      const filterEnd = new Date(`${selectedDate}T23:59:59`);

      matchesDate = bookingStart <= filterEnd && bookingEnd >= filterStart;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedDate('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] w-full">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Procurar
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Procurar por colaborador ou recurso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="w-full md:w-44">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Tipo de Recurso
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {translateType(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-44">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Estado
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-44">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Data Específica
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          />
        </div>

        {(searchTerm || selectedStatus || selectedType || selectedDate) && (
          <button
            onClick={handleResetFilters}
            className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            Limpar
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs text-gray-500 px-1">
        <span>
          A mostrar <b>{filteredBookings.length}</b> de <b>{bookings.length}</b> reservas
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 table-auto min-w-[800px] lg:min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/4">Colaborador</th>
                <th className="px-6 py-4 font-semibold w-1/4">Recurso</th>
                <th className="px-6 py-4 font-semibold w-40">Data Início</th>
                <th className="px-6 py-4 font-semibold w-40">Data Fim</th>
                <th className="px-6 py-4 font-semibold w-28">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Não existem reservas ativas no sistema.
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Nenhuma reserva encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((reserva) => {
                  const dataInicio = new Date(reserva.start_time).toLocaleString('pt-PT', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });
                  const dataFim = new Date(reserva.end_time).toLocaleString('pt-PT', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  const getStatusBadge = (status) => {
                    switch (status) {
                      case 'confirmed':
                        return (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-success-light text-success-hover">
                            Confirmada
                          </span>
                        );
                      case 'completed':
                        return (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            Concluída
                          </span>
                        );
                      case 'cancelled':
                      default:
                        return (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                            Cancelada
                          </span>
                        );
                    }
                  };

                  return (
                    <tr key={reserva.booking_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800 block">{reserva.user_name}</span>
                        <span className="text-xs text-gray-400">{reserva.user_email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800 block">{reserva.resource_name}</span>
                        <span className="text-xs text-gray-400">{translateType(reserva.resource_type)}</span>
                      </td>
                      <td className="px-6 py-4">{dataInicio}</td>
                      <td className="px-6 py-4">{dataFim}</td>
                      <td className="px-6 py-4">{getStatusBadge(reserva.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BookingTable;
