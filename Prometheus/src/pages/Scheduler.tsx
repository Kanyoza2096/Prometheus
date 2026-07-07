import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, Clock, Users, MapPin, Edit2, Trash2 } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'Team Meeting',
    date: '2024-01-15',
    time: '10:00 AM - 11:00 AM',
    location: 'Conference Room A',
    attendees: 5,
    color: '#4F46E5',
  },
  {
    id: 2,
    title: 'Client Presentation',
    date: '2024-01-16',
    time: '2:00 PM - 3:30 PM',
    location: 'Zoom',
    attendees: 12,
    color: '#10B981',
  },
  {
    id: 3,
    title: 'Product Launch',
    date: '2024-01-20',
    time: '9:00 AM - 12:00 PM',
    location: 'Main Hall',
    attendees: 50,
    color: '#F59E0B',
  },
  {
    id: 4,
    title: 'Review Session',
    date: '2024-01-18',
    time: '3:00 PM - 4:00 PM',
    location: 'Office',
    attendees: 3,
    color: '#EF4444',
  },
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState(15);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-brand-primary" />
            Scheduler
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">EVENT SCHEDULING & CALENDAR MANAGEMENT</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-brand-text">January 2024</h2>
            <div className="flex gap-2">
              {(['month', 'week', 'day'] as const).map((v, idx) => (
                <motion.button
                  key={v}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView(v)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                    view === v
                      ? 'bg-brand-primary text-white'
                      : 'bg-brand-elevated text-brand-text hover:bg-brand-border/30'
                  )}
                >
                  {v}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {days.map((day, idx) => (
              <motion.div
                key={day}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.03 }}
                className="text-center text-xs font-bold text-brand-text-muted py-2"
              >
                {day}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day, idx) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.02 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'aspect-square rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer transition-all',
                  selectedDate === day
                    ? 'bg-brand-primary text-white shadow-glow-primary'
                    : 'bg-brand-elevated text-brand-text hover:bg-brand-border/30'
                )}
              >
                {day}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-brand-text mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.08 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="p-4 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-full rounded-full mt-1"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-brand-text mb-1">{event.title}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-brand-text-muted font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-brand-text-muted font-mono">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-brand-text-muted font-mono">
                        <Users className="w-3 h-3" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-2 py-1 text-xs font-bold text-brand-text bg-brand-surface rounded-lg hover:bg-brand-border/30 transition-colors flex items-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-2 py-1 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}