// components/WeeklyCalendar.tsx
import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { EventItem } from "./LessonManager";

export interface WeeklyCalendarProps {
  events: EventItem[];
  onSelect: (id: string) => void;
  onEdit:   (id: string) => void;
  onDelete: (id: string) => void;
  weekStart?: Date; // opcjonalnie początek tygodnia
}

// polskie nazwy dni
const dayNames = ["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"];

export function WeeklyCalendar({ events, onSelect, onEdit, onDelete, weekStart }: WeeklyCalendarProps) {
  // godziny od 8 do 20
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  
  // oblicz początek tygodnia (poniedziałek)
  const today = weekStart ? new Date(weekStart) : new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  // getDay: 0 niedz, 1 pon...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff);

  // tablica dat w tygodniu
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const slotHeader = 40;    // px wysokość nagłówka z dniami
  const slotHeight = 72;    // px wysokość jednej godziny
  const totalHeight = slotHeader + slotHeight * hours.length;

  // konwersja "HH:MM" → minuty
  const parseHM = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  return (
    <div
      className="relative overflow-auto border rounded-lg"
      style={{
        height: totalHeight,
        display: "grid",
        gridTemplateColumns: "4rem repeat(7, 1fr)",
      }}
    >
      {/* nagłówek dni */}
      <div style={{ height: slotHeader }} />
      {weekDates.map((d) => (
        <div
          key={d.toDateString()}
          className="border-b flex flex-col items-center justify-center font-semibold text-sm p-1"
          style={{ height: slotHeader }}
        >
          <span>{dayNames[d.getDay()]}</span>
          <span className="text-xs text-gray-600">
            {String(d.getDate()).padStart(2, '0')}.{String(d.getMonth()+1).padStart(2, '0')}
          </span>
        </div>
      ))}

      {/* siatka godzin */}
      {hours.map((h) => (
        <React.Fragment key={h}>
          <div
            className="border-r flex items-center justify-end pr-2 text-xs text-gray-600"
            style={{ height: slotHeight }}
          >
            {h}:00
          </div>
          {weekDates.map((_, di) => (
            <div
              key={di}
              className="border-t border-l"
              style={{ height: slotHeight }}
            />
          ))}
        </React.Fragment>
      ))}

      {/* wydarzenia */}
      {events.map((evt) => {
        // znajdź index dnia w tygodniu
        const dayIdx = weekDates.findIndex(d => 
          d.getDay() === evt.date.getDay() && d.getDate() === evt.date.getDate() && d.getMonth() === evt.date.getMonth()
        );
        if (dayIdx < 0) return null;
        const [startStr, endStr] = evt.time.split(" - ");
        const startMin = parseHM(startStr);
        const endMin   = parseHM(endStr);
        const topPx    = slotHeader + ((startMin - 8 * 60) / 60) * slotHeight;
        const heightPx = ((endMin - startMin) / 60) * slotHeight;

        return (
          <div
            key={evt.id}
            onClick={() => onSelect(evt.id)}
            className="absolute bg-indigo-500 text-white rounded cursor-pointer"
            style={{
              left:   `calc(4rem + ${dayIdx} * ((100% - 4rem) / 7))`,
              width:  `calc((100% - 4rem) / 7)` ,
              top:    `${topPx}px`,
              height: `${heightPx}px`,
            }}
          >
            <div className="flex justify-between items-start p-1">
              <span className="text-sm font-semibold truncate">
                {evt.title}
              </span>
              <div className="flex space-x-1 text-sm opacity-80">
                <FaEdit onClick={(e) => { e.stopPropagation(); onEdit(evt.id); }} />
                <FaTrash onClick={(e) => { e.stopPropagation(); onDelete(evt.id); }} />
              </div>
            </div>
            <div className="text-[10px] px-1 truncate">{evt.time}</div>
          </div>
        );
      })}
    </div>
  );
}
