"use client";

// app/components/ContentScheduler.tsx
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const ContentScheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sites] = useState([
    { id: 1, name: 'Site 1', updateDays: [1, 3, 5], startId: 101 }, // Mon/Wed/Fri
    { id: 2, name: 'Site 2', updateDays: [2, 4, 6], startId: 201 }  // Tue/Thu/Sat
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Content Update Calendar
          </h2>
        </div>
        <div className="text-center">
          {currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ContentScheduler;
