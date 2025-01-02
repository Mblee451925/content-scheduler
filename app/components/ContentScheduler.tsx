"use client";

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

const STATUS_STYLES = {
 pending: {
   bg: 'bg-gray-100 hover:bg-gray-200',
   text: 'text-gray-800',
 },
 'in-progress': {
   bg: 'bg-orange-100 hover:bg-orange-200',
   text: 'text-orange-800',
 },
 review: {
   bg: 'bg-purple-100 hover:bg-purple-200',
   text: 'text-purple-800',
 },
 complete: {
   bg: 'bg-emerald-100 hover:bg-emerald-200',
   text: 'text-emerald-800',
 },
};

const ContentScheduler = () => {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [sites, setSites] = useState([
   { id: 1, name: 'Site 1', updateDays: [1, 3, 5], startId: 101 },
   { id: 2, name: 'Site 2', updateDays: [2, 4, 6], startId: 201 }
 ]);
 const [contentDetails, setContentDetails] = useState({
   'C101': { title: 'First Update', status: 'in-progress' },
   'C102': { title: 'Second Update', status: 'pending' },
   'C201': { title: 'Site 2 Update', status: 'complete' }
 });
 const [selectedSiteId, setSelectedSiteId] = useState('all');

 const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

 const generateContentId = (site, date) => {
   const dayOfWeek = date.getDay();
   if (site.updateDays.includes(dayOfWeek)) {
     const contentNumber = site.startId + Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (24 * 60 * 60 * 1000) / 7) * 3;
     return `C${contentNumber}`;
   }
   return null;
 };

 const getDaysInMonth = () => {
   const year = currentDate.getFullYear();
   const month = currentDate.getMonth();
   const firstDay = new Date(year, month, 1);
   const lastDay = new Date(year, month + 1, 0);
   const days = [];

   for (let i = 0; i < firstDay.getDay(); i++) {
     days.push(null);
   }

   for (let i = 1; i <= lastDay.getDate(); i++) {
     days.push(new Date(year, month, i));
   }

   return days;
 };

 const navigateMonth = (direction: number) => {
   setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
 };

 const handleContentClick = (contentId, date) => {
   const newStatus = prompt('Enter status (pending, in-progress, review, complete):');
   if (newStatus && STATUS_STYLES[newStatus]) {
     setContentDetails(prev => ({
       ...prev,
       [contentId]: {
         ...prev[contentId],
         status: newStatus,
         title: prev[contentId]?.title || 'New Update'
       }
     }));
   }
 };

 const getStatusColor = (status) => {
   return status ? `${STATUS_STYLES[status].bg} ${STATUS_STYLES[status].text}` : `${STATUS_STYLES.pending.bg} ${STATUS_STYLES.pending.text}`;
 };

 return (
   <div className="w-full max-w-4xl mx-auto">
     <div className="bg-white shadow rounded-lg p-4">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-xl font-bold flex items-center gap-2">
           <Calendar className="h-5 w-5" />
           Content Update Calendar
         </h2>
         <div className="flex items-center gap-4">
           <select
             value={selectedSiteId}
             onChange={(e) => setSelectedSiteId(e.target.value)}
             className="border rounded p-2"
           >
             <option value="all">All Sites</option>
             {sites.map(site => (
               <option key={site.id} value={site.id}>{site.name}</option>
             ))}
           </select>
           <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded">
             <ChevronLeft className="h-5 w-5" />
           </button>
           <span className="text-lg font-medium">
             {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
           </span>
           <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded">
             <ChevronRight className="h-5 w-5" />
           </button>
         </div>
       </div>
       
       <div className="grid grid-cols-7 gap-1">
         {weekdays.map(day => (
           <div key={day} className="p-2 text-center font-medium bg-gray-50">
             {day}
           </div>
         ))}
         
         {getDaysInMonth().map((date, index) => (
           <div 
             key={index}
             className="p-2 min-h-[100px] border bg-white"
           >
             {date && (
               <>
                 <div className="text-gray-500">{date.getDate()}</div>
                 {sites
                   .filter(site => selectedSiteId === 'all' || site.id.toString() === selectedSiteId)
                   .map(site => {
                     const contentId = generateContentId(site, date);
                     if (!contentId) return null;
                     const details = contentDetails[contentId];
                     return (
                       <div
                         key={`${site.id}-${date}`}
                         onClick={() => handleContentClick(contentId, date)}
                         className={`mt-1 p-2 rounded text-sm cursor-pointer ${getStatusColor(details?.status)}`}
                       >
                         <div className="font-medium">{contentId}</div>
                         <div className="text-xs">{site.name}</div>
                         {details?.title && (
                           <div className="text-xs truncate">{details.title}</div>
                         )}
                       </div>
                     );
                   })}
               </>
             )}
           </div>
         ))}
       </div>
     </div>
   </div>
 );
};

export default ContentScheduler;