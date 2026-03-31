export function parseTaskDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
}

export function isOverdue(dateStr) {
  const d = parseTaskDate(dateStr);
  if (!d) return false;
  // Overdue if the date/time has passed. If it's a date-only task, overdue if it's before today 00:00:00
  const now = new Date();
  return d.getTime() < now.getTime();
}

export function isToday(dateStr) {
  const d = parseTaskDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getDate() === now.getDate() &&
         d.getMonth() === now.getMonth() &&
         d.getFullYear() === now.getFullYear();
}

export function isUpcoming(dateStr) {
  const d = parseTaskDate(dateStr);
  if (!d) return false;
  if (isToday(dateStr) || isOverdue(dateStr)) return false;
  return true; // Simple logic: if not overdue and not today, it's upcoming
}

export function isThisWeek(dateStr) {
  const d = parseTaskDate(dateStr);
  if (!d) return false;
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  return d.getTime() >= startOfWeek.getTime();
}

export function getCompletedThisWeekCount(tasks) {
  return tasks.filter(t => t.completed && t.completedAt && isThisWeek(t.completedAt)).length;
}

export function formatDisplayDate(dateStr, hasTime = false) {
  const d = parseTaskDate(dateStr);
  if (!d) return '';

  if (isToday(dateStr)) {
    return hasTime 
      ? `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
      : 'Today';
  }

  // Check tomorrow
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear()) {
    return hasTime 
      ? `Tomorrow at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
      : 'Tomorrow';
  }

  const dateOpts = { month: 'short', day: 'numeric' };
  const dStr = d.toLocaleDateString([], dateOpts);
  
  if (hasTime) {
    return `${dStr}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return dStr;
}

// Get standard offset date based on string '1h', '1d', etc.
export function applyReminderOffset(dueDateStr, offsetStr) {
  const d = parseTaskDate(dueDateStr);
  if (!d) return null;
  const out = new Date(d);
  if (offsetStr === '15m') out.setMinutes(out.getMinutes() - 15);
  else if (offsetStr === '1h') out.setHours(out.getHours() - 1);
  else if (offsetStr === '1d') out.setDate(out.getDate() - 1);
  return out.toISOString();
}
