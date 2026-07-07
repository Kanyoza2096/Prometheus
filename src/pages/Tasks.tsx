import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Plus, Trash2, Edit2, Clock, Users, Flag } from 'lucide-react';

const tasks = [
  { id: 1, title: 'Complete project documentation', status: 'todo', priority: 'high', assignee: 'John', dueDate: '2024-01-16' },
  { id: 2, title: 'Review pull requests', status: 'in-progress', priority: 'medium', assignee: 'Sarah', dueDate: '2024-01-15' },
  { id: 3, title: 'Design new dashboard', status: 'done', priority: 'low', assignee: 'Mike', dueDate: '2024-01-14' },
  { id: 4, title: 'Client onboarding', status: 'todo', priority: 'high', assignee: 'Emily', dueDate: '2024-01-18' },
  { id: 5, title: 'Update API documentation', status: 'in-progress', priority: 'medium', assignee: 'Chris', dueDate: '2024-01-17' },
  { id: 6, title: 'Testing and QA', status: 'todo', priority: 'high', assignee: 'Alex', dueDate: '2024-01-20' },
];

const columns = [
  { id: 'todo', title: 'To Do', color: '#64748b' },
  { id: 'in-progress', title: 'In Progress', color: '#4F46E5' },
  { id: 'done', title: 'Done', color: '#10B981' },
];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Tasks() {
  const [tasksData, setTasksData] = useState(tasks);
  const [newTask, setNewTask] = useState('');

  const priorityColors = {
    high: 'bg-brand-danger/20 text-brand-danger',
    medium: 'bg-brand-warning/20 text-brand-warning',
    low: 'bg-brand-success/20 text-brand-success',
  };

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
            <CheckSquare className="w-8 h-8 mr-3 text-brand-primary" />
            Tasks
          </h1>
          <p className="text-brand-text-muted text-sm font-mono mt-1">TASK MANAGEMENT & KANBAN BOARD</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column, colIdx) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + colIdx * 0.1 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-text flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                {column.title}
                <span className="text-brand-text-muted bg-brand-elevated px-2 py-0.5 rounded-lg text-xs">
                  {tasksData.filter((t) => t.status === column.id).length}
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {tasksData
                .filter((task) => task.status === column.id)
                .map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3 + colIdx * 0.1 + idx * 0.06 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer"
                  >
                    <h3 className="text-sm font-bold text-brand-text mb-2">{task.title}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        priorityColors[task.priority as keyof typeof priorityColors]
                      )}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-brand-text-muted font-mono mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-2 py-1 text-xs font-bold text-brand-text bg-brand-surface rounded-lg hover:bg-brand-border/30 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-2 py-1 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}