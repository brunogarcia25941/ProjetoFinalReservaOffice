import React from 'react';

function BookingTable({ bookings }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
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
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Não existem reservas ativas no sistema.</td>
              </tr>
            ) : (
              bookings.map((reserva) => {
                const dataInicio = new Date(reserva.start_time).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                const dataFim = new Date(reserva.end_time).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });

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
                      <span className="text-xs text-gray-400 capitalize">{reserva.resource_type}</span>
                    </td>
                    <td className="px-6 py-4">{dataInicio}</td>
                    <td className="px-6 py-4">{dataFim}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(reserva.status)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingTable;
