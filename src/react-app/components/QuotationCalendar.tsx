import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

interface QuotationCalendarProps {
  quotations: any[];
}

export default function QuotationCalendar({ quotations }: QuotationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const quotationsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    quotations.forEach((q) => {
      const date = new Date(q.quotation_date);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const day = date.getDate();
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(q);
      }
    });
    return grouped;
  }, [quotations, month, year]);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Quotation Calendar</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <span className="text-lg font-semibold text-slate-800 min-w-[200px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center py-2 text-sm font-semibold text-slate-600">
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          const dayQuotations = day ? quotationsByDate[day] || [] : [];
          const isToday =
            day &&
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={index}
              className={`min-h-[100px] border border-slate-200 rounded-lg p-2 ${
                day ? "bg-white hover:bg-slate-50" : "bg-slate-50"
              } ${isToday ? "ring-2 ring-blue-500" : ""} transition-all`}
            >
              {day && (
                <>
                  <div className={`text-sm font-medium mb-2 ${isToday ? "text-blue-600" : "text-slate-700"}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayQuotations.slice(0, 2).map((q) => (
                      <Link
                        key={q.id}
                        to={`/quotations/${q.id}`}
                        className="block text-xs p-1.5 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(q.status)}`} />
                          <span className="truncate font-medium text-slate-800">
                            {q.quotation_number}
                          </span>
                        </div>
                        <div className="text-slate-600 truncate mt-0.5">
                          {q.customer_name}
                        </div>
                      </Link>
                    ))}
                    {dayQuotations.length > 2 && (
                      <div className="text-xs text-slate-500 text-center py-1">
                        +{dayQuotations.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
