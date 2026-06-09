import React from 'react';

function BookingTable({ bookings }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
      <table className="w-full text-left text-sm text-gray-600 table-fixed">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
          <tr>
            <th className="px-6 py-4 font-semibold">Colaborador</th>
            <th className="px-6 py-4 font-semibold">Recurso</th>
            <th className="px-6 py-4 font-semibold">Data Início</th>
            <th className="px-6 py-4 font-semibold">Data Fim</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
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
              const ativa = reserva.status === 'confirmed';

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
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ativa ? 'bg-success-light text-success-hover' : 'bg-gray-100 text-gray-700'}`}>
                      {ativa ? 'Confirmada' : 'Cancelada'}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BookingTable;
