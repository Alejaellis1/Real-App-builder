import React from 'react';

const appointmentsData = [
    { time: '10:00 AM', client: 'Jessica P.', service: 'Signature Facial', status: 'Confirmed' },
    { time: '11:30 AM', client: 'Emily R.', service: 'Botox Touch-up', status: 'Confirmed' },
    { time: '02:00 PM', client: 'Samantha V.', service: 'Consultation', status: 'Pending' },
];

const CalendarDay = ({ day, date, isToday = false }: { day: string; date: number; isToday?: boolean }) => (
    <div className={`text-center p-3 rounded-lg border ${isToday ? 'bg-rose-500 text-white border-rose-500' : 'bg-white border-stone-200'}`}>
        <p className="text-xs font-semibold opacity-80">{day}</p>
        <p className="font-bold text-xl mt-1">{date}</p>
    </div>
);

const Appointments: React.FC = () => {
  return (
    <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl border border-stone-200">
            <h3 className="font-bold text-lg mb-4 text-stone-800">This Week</h3>
            <div className="grid grid-cols-7 gap-3">
                <CalendarDay day="MON" date={18} />
                <CalendarDay day="TUE" date={19} />
                <CalendarDay day="WED" date={20} isToday />
                <CalendarDay day="THU" date={21} />
                <CalendarDay day="FRI" date={22} />
                <CalendarDay day="SAT" date={23} />
                <CalendarDay day="SUN" date={24} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-stone-800">Today's Schedule</h3>
                 <button className="text-sm font-semibold text-white bg-stone-800 px-4 py-2 rounded-lg hover:bg-stone-700">
                    New Booking
                </button>
            </div>
            <ul className="divide-y divide-stone-200">
                {appointmentsData.length > 0 ? (
                    appointmentsData.map((appt, index) => (
                        <li key={index} className="flex items-center justify-between py-4">
                            <div className="flex items-center">
                                <div className="w-16 text-sm font-semibold text-stone-700">{appt.time}</div>
                                <div>
                                    <p className="font-semibold text-stone-800">{appt.client}</p>
                                    <p className="text-sm text-stone-500">{appt.service}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {appt.status}
                                </span>
                                <button className="text-stone-400 hover:text-stone-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="text-center py-10 text-stone-500">
                        No appointments scheduled for today.
                    </li>
                )}
            </ul>
        </div>
    </div>
  );
};

export default Appointments;
