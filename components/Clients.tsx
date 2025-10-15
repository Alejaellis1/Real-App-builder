
import React from 'react';

const clientsData = [
  { name: 'Eleanor Pena', lastVisit: '2 days ago', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { name: 'Cody Fisher', lastVisit: '1 week ago', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  { name: 'Jane Cooper', lastVisit: '3 weeks ago', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
  { name: 'Robert Fox', lastVisit: '1 month ago', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
];

const Clients: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-stone-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-stone-800">Client List</h3>
          <p className="text-sm text-stone-500">You have {clientsData.length} clients.</p>
        </div>
         <button className="text-sm font-semibold text-white bg-stone-800 px-4 py-2 rounded-lg hover:bg-stone-700">
          Add New Client
        </button>
      </div>
      
      <div className="mb-4">
        <input 
            type="text" 
            placeholder="Search clients..."
            className="w-full bg-stone-50 text-stone-800 rounded-lg border-stone-300 focus:ring-rose-300 focus:border-rose-300 shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
        />
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-stone-200 text-sm text-stone-500">
            <th className="py-3 font-semibold">Name</th>
            <th className="py-3 font-semibold">Last Visit</th>
            <th className="py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clientsData.length > 0 ? (
            clientsData.map((client) => (
              <tr key={client.name} className="border-b border-stone-200 last:border-b-0">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full" />
                    <span className="font-semibold text-stone-800">{client.name}</span>
                  </div>
                </td>
                <td className="py-4 text-stone-600">{client.lastVisit}</td>
                <td className="py-4 text-right">
                  <button className="text-sm font-semibold text-rose-600 hover:text-rose-800">
                    View Details
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center py-10 text-stone-500">
                No clients found. Add a new client to get started!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Clients;
