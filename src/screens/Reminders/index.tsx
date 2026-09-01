import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { getActivePatient } from '@/lib/storage';
import { getRemindersForPatient, updateReminderStatus, resetTodayReminders } from '@/lib/storage/reminders';
import type { Reminder } from '@/lib/storage/db';
import { speakText } from '@/lib/voice';
import styles from './Reminders.module.css';

const ICON_MAP: Record<string, string> = {
  medicine: '💊',
  hydration: '💧',
  activity: '🚶',
  appointment: '📅',
};

const COLOR_MAP: Record<string, string> = {
  medicine: '#FFE4E1',
  hydration: '#E0FFFF',
  activity: '#F0FFF0',
  appointment: '#FFF0F5',
};

export function RemindersScreen() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const loadReminders = async () => {
    const patient = await getActivePatient();
    if (!patient) return;
    
    const allReminders = await getRemindersForPatient(patient.id);
    
    // Filter for today's reminders
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
    
    const todays = allReminders.filter(r => r.scheduled_time >= startOfToday && r.scheduled_time < endOfToday);
    
    // Sort by scheduled time
    todays.sort((a, b) => a.scheduled_time - b.scheduled_time);
    
    setReminders(todays);
  };
  
  useEffect(() => {
    loadReminders();
    
    // Set up an interval to refresh the screen every minute (to highlight overdue)
    const interval = setInterval(() => {
      setReminders(r => [...r]); // Trigger re-render to update overdue status
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Find next pending reminder (could be overdue)
  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const nextReminder = pendingReminders.length > 0 ? pendingReminders[0] : null;
  
  // Speak the next reminder when it appears
  useEffect(() => {
    if (nextReminder) {
      const label = t(nextReminder.label as any);
      speakText(label, language);
    }
  }, [nextReminder?.id, language, t]);
  
  const handleStatusUpdate = async (id: string, status: 'done' | 'snoozed') => {
    await updateReminderStatus(id, status);
    await loadReminders();
  };

  const handleReset = async () => {
    if (window.confirm(t('reminder.reset.confirm' as any))) {
      const patient = await getActivePatient();
      await resetTodayReminders(patient?.id);
      await loadReminders();
    }
  };
  
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const isOverdue = (ts: number) => {
    return ts < Date.now();
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t('screen.reminders.title' as any)}</div>
        <div className={styles.headerActions}>
          <button 
            onClick={handleReset} 
            className={styles.resetBtn}
            title={t('reminder.reset' as any)}
            aria-label={t('reminder.reset' as any)}
          >
            {t('reminder.reset' as any)}
          </button>
          <button onClick={() => navigate('/')} className={styles.backBtn}>
            {t('nav.back' as any)}
          </button>
        </div>
      </div>
      
      {nextReminder ? (
        <div className={`${styles.nextReminderCard} ${isOverdue(nextReminder.scheduled_time) ? styles.overdue : ''}`} style={{ backgroundColor: COLOR_MAP[nextReminder.type] || '#fff' }}>
          <div className={styles.nextIcon} aria-hidden="true">{ICON_MAP[nextReminder.type] || '🔔'}</div>
          <div className={styles.nextTime}>{formatTime(nextReminder.scheduled_time)}</div>
          <div className={styles.nextLabel}>{t(nextReminder.label as any)}</div>
          
          <div className={styles.actionButtons}>
            <button 
              className={styles.btnDone} 
              onClick={() => handleStatusUpdate(nextReminder.id, 'done')}
            >
              {t('reminder.action.done' as any)}
            </button>
            <button 
              className={styles.btnSnooze}
              onClick={() => handleStatusUpdate(nextReminder.id, 'snoozed')}
            >
              {t('reminder.action.snooze' as any)}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          {t('reminder.empty' as any)}
        </div>
      )}
      
      <div className={styles.sectionTitle}>{t('reminder.section.later' as any)}</div>
      <div className={styles.list}>
        {reminders.map(r => (
          <div key={r.id} className={styles.listItem}>
            <div className={styles.listIcon} aria-hidden="true">{ICON_MAP[r.type] || '🔔'}</div>
            <div className={styles.listContent}>
              <div className={styles.listTime}>{formatTime(r.scheduled_time)}</div>
              <div className={styles.listLabel}>{t(r.label as any)}</div>
            </div>
            <div className={`${styles.listStatus} ${styles[`status_${r.status}`]}`}>
              {t(`reminder.status.${r.status}` as any)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
