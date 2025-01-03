"use client";

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const STATUS_STYLES = {
  pending: {
    bg: 'bg-gray-100 hover:bg-gray-200',
    text: 'text-gray-800',
    label: 'Pending'
  },
  'in-progress': {
    bg: 'bg-orange-100 hover:bg-orange-200',
    text: 'text-orange-800',
    label: 'In Progress'
  },
  review: {
    bg: 'bg-purple-100 hover:bg-purple-200',
    text: 'text-purple-800',
    label: 'Review'
  },
  complete: {
    bg: 'bg-emerald-100 hover:bg-emerald-200',
    text: 'text-emerald-800',
    label: 'Complete'
  },
};

interface ContentDetails {
  title: string;
  description?: string;
  notes?: string;
  status: keyof typeof STATUS_STYLES;
  siteId: number;
  date: Date;
}

const ContentScheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recalculateSequence, setRecalculateSequence] = useState(false);
  const [sites, setSites] = useState([
    { id: 1, name: 'Site 1', updateDays: [1, 3, 5], startId: 101 },
    { id: 2, name: 'Site 2', updateDays: [2, 4, 6], startId: 201 }
  ]);
  const [contentDetails, setContentDetails] = useState<Record<string, ContentDetails>>({
    'C101': { 
      title: 'First Update', 
      description: 'Initial content update', 
      notes: '',
      status: 'in-progress',
      siteId: 1,
      date: new Date()
    },
    'C102': { 
      title: 'Second Update', 
      description: 'Follow-up content', 
      notes: '',
      status: 'pending',
      siteId: 1,
      date: new Date()
    },
    'C201': { 
      title: 'Site 2 Update', 
      description: 'Main site update', 
      notes: '',
      status: 'complete',
      siteId: 2,
      date: new Date()
    }
  });
  const [selectedSiteId, setSelectedSiteId] = useState('all');
  const [editingContent, setEditingContent] = useState<{
    id: string;
    originalId: string;
    details: ContentDetails;
  } | null>(null);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateContentId = (site, date) => {
    const dayOfWeek = date.getDay();
    if (site.updateDays.includes(dayOfWeek)) {
      return `C${site.startId}`;
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

  const handleContentClick = (contentId: string, date: Date, site: any) => {
    const currentDetails = contentDetails[contentId] || {
      title: '',
      description: '',
      notes: '',
      status: 'pending' as const,
      siteId: site.id,
      date: date
    };
    
    setEditingContent({
      id: contentId,
      originalId: contentId,
      details: { ...currentDetails }
    });
    setIsModalOpen(true);
  };

  const handleContentIdChange = (newId: string) => {
    if (!editingContent) return;
    
    const oldId = editingContent.id;
    if (recalculateSequence) {
      // Recalculate all subsequent content IDs
      const affectedSite = sites.find(site => site.id === editingContent.details.siteId);
      if (!affectedSite) return;

      const updatedDetails = { ...contentDetails };
      const prefix = newId.charAt(0);
      const newBaseNumber = parseInt(newId.slice(1));
      
      Object.keys(updatedDetails).forEach(key => {
        if (key.startsWith(prefix) && parseInt(key.slice(1)) > parseInt(oldId.slice(1))) {
          const diff = parseInt(key.slice(1)) - parseInt(oldId.slice(1));
          const newKey = `${prefix}${newBaseNumber + diff}`;
          updatedDetails[newKey] = updatedDetails[key];
          delete updatedDetails[key];
        }
      });
      
      setContentDetails(updatedDetails);
    }

    setEditingContent(prev => prev ? {
      ...prev,
      id: newId
    } : null);
  };

  const handleSaveContent = () => {
    if (editingContent) {
      const updatedDetails = { ...contentDetails };
      
      if (editingContent.id !== editingContent.originalId) {
        delete updatedDetails[editingContent.originalId];
      }
      
      updatedDetails[editingContent.id] = editingContent.details;
      setContentDetails(updatedDetails);
      setIsModalOpen(false);
      setEditingContent(null);
    }
  };

  const getStatusColor = (contentId) => {
    const status = contentDetails[contentId]?.status || 'pending';
    return `${STATUS_STYLES[status].bg} ${STATUS_STYLES[status].text}`;
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
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
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
                      
                      return (
                        <div
                          key={`${site.id}-${date}`}
                          onClick={() => handleContentClick(contentId, date, site)}
                          className={`mt-1 p-2 rounded text-sm cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(contentId)}`}
                        >
                          <div className="font-medium">{contentId}</div>
                          <div className="text-xs">{site.name}</div>
                          {contentDetails[contentId]?.title && (
                            <div className="text-xs truncate">{contentDetails[contentId].title}</div>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Content Details</DialogTitle>
          </DialogHeader>
          {editingContent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Site</Label>
                  <Input 
                    value={sites.find(s => s.id === editingContent.details.siteId)?.name || ''}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input 
                    value={editingContent.details.date?.toLocaleDateString() || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contentId">Content ID</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    id="contentId"
                    value={editingContent.id}
                    onChange={(e) => handleContentIdChange(e.target.value)}
                    placeholder="Enter content ID"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={recalculateSequence}
                        onCheckedChange={setRecalculateSequence}
                      />
                      <Label className="font-medium">Recalculate sequence</Label>
                    </div>
                    <span className="text-xs text-gray-500 pl-14">
                      {recalculateSequence ? 
                        "ON - Will update all following content numbers" : 
                        "OFF - Will only change this content number"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingContent.details.title}
                  onChange={(e) => setEditingContent(prev => prev ? {
                    ...prev,
                    details: { ...prev.details, title: e.target.value }
                  } : null)}
                  placeholder="Enter content title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingContent.details.description || ''}
                  onChange={(e) => setEditingContent(prev => prev ? {
                    ...prev,
                    details: { ...prev.details, description: e.target.value }
                  } : null)}
                  placeholder="Enter content description"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={editingContent.details.notes || ''}
                  onChange={(e) => setEditingContent(prev => prev ? {
                    ...prev,
                    details: { ...prev.details, notes: e.target.value }
                  } : null)}
                  placeholder="Enter additional notes"
                />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <RadioGroup
                  value={editingContent.details.status}
                  onValueChange={(value: keyof typeof STATUS_STYLES) => setEditingContent(prev => prev ? {
                    ...prev,
                    details: { ...prev.details, status: value }
                  } : null)}
                >
                  {Object.entries(STATUS_STYLES).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key}>{value.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveContent}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentScheduler;