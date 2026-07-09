import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Plus, Trash2, ArrowRight, Clock, Users } from 'lucide-react';
import { useStore } from '../store/useStore';

const defaultTasks = [
  { id: 1, title: 'Complete project documentation', status: 'todo', priority: 'high', assignee: 'John', dueDate: '2026-07-16' },
  { id: 2, title: 'Review pull requests', status: 'in-progress', priority: 'medium', assignee: 'Sarah', dueDate: '2026-07-15' },
  { id: 3, title: 'Design new dashboard', status: 'done', priority: 'low', assignee: 'Mike', dueDate: '2026-07-14' },
  { id: 4, title: 'Client onboarding', status: 'todo', priority: 'high', assignee: 'Emily', dueDate: '2026-07-18' },
  { id: 5, title: 'Update API documentation', status: 'in-progress', priority: 'medium', assignee: 'Chris', dueDate: '2026-07-17' },
  { id: 6, title: 'Testing and QA', status: 'todo', priority: 'high', assignee: 'Alex', dueDate: '2026-07-20' },
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
  const triggerNotification = useStore((state) => state.triggerNotification);
  const [tasksData, setTasksData] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kanyoza_tasks');
      return saved ? JSON.parse(saved) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });
  const [newTask, setNewTask] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  useEffect(() => {
    localStorage.setItem('kanyoza_tasks', JSON.stringify(tasksData));
  }, [tasksData]);

  const priorityColors = {
    high: 'bg-brand-danger/20 text-brand-danger',
    medium: 'bg-brand-warning/20 text-brand-warning',
    low: 'bg-brand-success/20 text-brand-success',
  };

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTask.trim()) {
      triggerNotification({
        title: 'Validation Error',
        message: 'Task title cannot be empty',
        type: 'warning',
      });
      return;
    }

    const created: any = {
      id: Date.now(),
      title: newTask.trim(),
      status: 'todo',
      priority: taskPriority,
      assignee: 'Administrator',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    };

    setTasksData((prev) => [created, ...prev]);
    setNewTask('');
    triggerNotification({
      title: 'Task Added',
      message: `"${created.title}" was successfully created in To Do list`,
      type: 'success',
    });
  };

  const handleDeleteTask = (id: number, title: string) => {
    setTasksData((prev) => prev.filter((t) => t.id !== id));
    triggerNotification({
      title: 'Task Deleted',
      message: `"${title}" has been removed`,
      type: 'info',
    });
  };

  const handleCycleStatus = (id: number, currentStatus: string) => {
    const statusSequence = ['todo', 'in-progress', 'done', 'todo'];
    const nextIdx = (statusSequence.indexOf(currentStatus) + 1) % 3;
    const nextStatus = statusSequence[nextIdx];

    setTasksData((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    const colTitle = columns.find(c => c.id === nextStatus)?.title || nextStatus;
    triggerNotification({
      title: 'Task Advanced',
      message: `Task status updated to ${colTitle}`,
      type: 'info',
    });
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
        <form onSubmit={handleAddTask} className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="New task title..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary min-w-[200px]"
          />
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
            className="px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-glow-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </motion.button>
        </form>
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
                <span className="text-brand-text-muted bg-brand-elevated px-2 py-0.5 rounded-lg text-xs font-mono">
                  {tasksData.filter((t) => t.status === column.id).length}
                </span>
              </h2>
            </div>
            <div className="space-y-3 min-h-[300px]">
              {tasksData
                .filter((task) => task.status === column.id)
                .map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3 + colIdx * 0.1 + idx * 0.06 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 bg-brand-elevated rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer relative group"
                  >
                    <h3 className="text-sm font-bold text-brand-text mb-2 pr-6">{task.title}</h3>
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
                        className="flex-1 px-2 py-1 text-xs font-bold text-brand-text bg-brand-surface rounded-lg hover:bg-brand-border/30 border border-brand-border transition-colors flex items-center justify-center space-x-1"
                        onClick={() => handleCycleStatus(task.id, task.status)}
                      >
                        <ArrowRight className="w-3 h-3 text-brand-primary" />
                        <span>Progress</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-2 py-1 text-xs font-bold text-brand-danger bg-brand-danger/10 rounded-lg hover:bg-brand-danger/20 transition-colors flex items-center justify-center space-x-1"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              {tasksData.filter((task) => task.status === column.id).length === 0 && (
                <div className="h-24 flex items-center justify-center border border-dashed border-brand-border rounded-xl text-brand-text-muted text-xs font-mono uppercase tracking-wider">
                  No Tasks
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
