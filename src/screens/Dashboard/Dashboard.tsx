/**
 * Caregiver Dashboard — Task E (FR-11, FR-12, FR-13, FR-14, FR-19).
 *
 * Provides a caregiver-centric view into engagement trends, session frequency,
 * adaptive difficulty levels, reminder compliance, and attention flags.
 *
 * CRITICAL CONSTRAINT (per AGENTS.md):
 * This is an engagement and caregiver-support tool, NOT a diagnostic or clinical device.
 * All indicators are strictly framed as cognitive engagement/progress observations.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, type TranslationKey } from '@/lib/i18n';
import { speak } from '@/lib/voice';
import {
  getActivePatient,
  getCaregiverForPatient,
  getSessionsForPatient,
  getRemindersForPatient,
  getAlertsForPatient,
  markSessionSynced,
  acknowledgeAlert,
  type Patient,
  type Caregiver,
  type Session,
  type Reminder,
  type Alert,
} from '@/lib/storage';
import { calculateNextDifficulty } from '@/games/adaptiveDifficulty';
import styles from './Dashboard.module.css';

const GAME_ICON_MAP: Record<string, string> = {
  counting: '🧮',
  finger_math: '🖐️',
  memory_match: '🧩',
};

/** Catmull-Rom to Cubic Bezier smooth spline generator for charts */
function createSmoothCurvedPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const tension = 0.2;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function DashboardScreen() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  // Data states
  const [patient, setPatient] = useState<Patient | null>(null);
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [storedAlerts, setStoredAlerts] = useState<Alert[]>([]);
  const [countingDiff, setCountingDiff] = useState<number>(1);
  const [mathDiff, setMathDiff] = useState<number>(1);
  const [memoryDiff, setMemoryDiff] = useState<number>(1);

  // UI states
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'history'>('overview');
  const [gameFilter, setGameFilter] = useState<'all' | 'counting' | 'finger_math' | 'memory_match'>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Load all dashboard data from Dexie IndexedDB
  const loadDashboardData = useCallback(async () => {
    const currentPatient = await getActivePatient();
    if (!currentPatient) return;
    setPatient(currentPatient);

    const [cg, sess, rems, alrts, cDiff, mDiff, memDiff] = await Promise.all([
      getCaregiverForPatient(currentPatient.id),
      getSessionsForPatient(currentPatient.id, 100),
      getRemindersForPatient(currentPatient.id),
      getAlertsForPatient(currentPatient.id),
      calculateNextDifficulty(currentPatient.id, 'counting'),
      calculateNextDifficulty(currentPatient.id, 'finger_math'),
      calculateNextDifficulty(currentPatient.id, 'memory_match'),
    ]);

    setCaregiver(cg || null);
    setSessions(sess);
    setReminders(rems);
    setStoredAlerts(alrts);
    setCountingDiff(cDiff);
    setMathDiff(mDiff);
    setMemoryDiff(memDiff);

    if (sess.length > 0) {
      setSelectedSessionId(sess[0].id);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived metrics
  const totalSessions = sessions.length;
  const unsyncedSessions = useMemo(
    () => sessions.filter((s) => !s.synced),
    [sessions]
  );

  const avgAccuracy = useMemo(() => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.accuracy, 0);
    return Math.round((sum / sessions.length) * 100);
  }, [sessions]);

  const totalEngagementMinutes = useMemo(() => {
    const totalMs = sessions.reduce((acc, s) => acc + (s.duration_ms || 0), 0);
    return Math.max(1, Math.round(totalMs / 60000));
  }, [sessions]);

  const reminderComplianceRate = useMemo(() => {
    const pastReminders = reminders.filter((r) => r.scheduled_time <= Date.now());
    if (pastReminders.length === 0) return 100;
    const doneCount = pastReminders.filter((r) => r.status === 'done').length;
    return Math.round((doneCount / pastReminders.length) * 100);
  }, [reminders]);

  const lastActivityTime = useMemo(() => {
    if (sessions.length === 0) return null;
    return new Date(sessions[0].timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  }, [sessions]);

  // Filtered sessions for trend chart
  const filteredSessions = useMemo(() => {
    if (gameFilter === 'all') return sessions;
    return sessions.filter((s) => s.game_type === gameFilter);
  }, [sessions, gameFilter]);

  // Chronological order for chart (oldest first)
  const chartSessions = useMemo(() => {
    return [...filteredSessions].reverse();
  }, [filteredSessions]);

  // Chart stats strip
  const chartStats = useMemo(() => {
    if (chartSessions.length === 0) {
      return { latest: 0, peak: 0, total: 0 };
    }
    const latest = Math.round(chartSessions[chartSessions.length - 1].accuracy * 100);
    const peak = Math.round(Math.max(...chartSessions.map((s) => s.accuracy)) * 100);
    return { latest, peak, total: chartSessions.length };
  }, [chartSessions]);

  // Selected session object for details popover
  const activeSession = useMemo(() => {
    if (!selectedSessionId) {
      return chartSessions.length > 0 ? chartSessions[chartSessions.length - 1] : null;
    }
    return chartSessions.find((s) => s.id === selectedSessionId) || chartSessions[chartSessions.length - 1] || null;
  }, [chartSessions, selectedSessionId]);

  // 7-day session frequency calculation
  const frequencyData = useMemo(() => {
    const days: { label: string; count: number; dateStr: string; isToday: boolean }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

      const count = sessions.filter(
        (s) => s.timestamp >= startOfDay && s.timestamp < endOfDay
      ).length;

      const dayName = d.toLocaleDateString(language === 'as' ? 'as-IN' : 'en-US', {
        weekday: 'short',
      });
      const dayNum = d.getDate();

      days.push({
        label: `${dayName} ${dayNum}`,
        count,
        dateStr: d.toISOString().split('T')[0],
        isToday: i === 0,
      });
    }
    return days;
  }, [sessions, language]);

  const maxFreqCount = useMemo(() => {
    const max = Math.max(...frequencyData.map((d) => d.count), 1);
    return max;
  }, [frequencyData]);

  // Rule-based attention flags computation
  const activeFlags = useMemo(() => {
    const flags: {
      id: string;
      type: 'missed_reminder' | 'declining_trend' | 'inactivity' | 'custom';
      title: string;
      desc: string;
      severity: 'warning' | 'critical' | 'info';
      actionLabel?: string;
      onAction?: () => void;
    }[] = [];

    // 1. Missed reminders
    const now = Date.now();
    reminders.forEach((r) => {
      const isMissed =
        r.status === 'missed' ||
        (r.status === 'pending' && r.scheduled_time < now - 30 * 60 * 1000);

      if (isMissed && !dismissedAlerts.has(`rem_${r.id}`)) {
        const timeStr = new Date(r.scheduled_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        flags.push({
          id: `rem_${r.id}`,
          type: 'missed_reminder',
          title: `${t('dashboard.alerts.flag.missed_reminder')}: ${t(r.label as TranslationKey, r.label)}`,
          desc: t('dashboard.alerts.flag.missed_reminder_desc').replace('{time}', timeStr),
          severity: 'warning',
          actionLabel: t('dashboard.alerts.action.acknowledge'),
          onAction: () => setDismissedAlerts((prev) => new Set(prev).add(`rem_${r.id}`)),
        });
      }
    });

    // 2. Declining performance trend observation (non-diagnostic)
    if (sessions.length >= 3 && !dismissedAlerts.has('flag_declining_trend')) {
      const recent3 = sessions.slice(0, 3);
      const earlier = sessions.slice(3);
      const recentAvg = recent3.reduce((sum, s) => sum + s.accuracy, 0) / 3;

      let isDeclining = false;
      if (earlier.length >= 2) {
        const earlierAvg = earlier.reduce((sum, s) => sum + s.accuracy, 0) / earlier.length;
        if (recentAvg < earlierAvg - 0.25 || (recentAvg <= 0.4 && earlierAvg >= 0.7)) {
          isDeclining = true;
        }
      } else if (
        recent3[0].accuracy < recent3[1].accuracy &&
        recent3[1].accuracy < recent3[2].accuracy &&
        recentAvg <= 0.5
      ) {
        isDeclining = true;
      }

      if (isDeclining) {
        flags.push({
          id: 'flag_declining_trend',
          type: 'declining_trend',
          title: t('dashboard.alert.declining_trend.title'),
          desc: t('dashboard.alert.declining_trend.desc'),
          severity: 'info',
          actionLabel: t('dashboard.alerts.action.acknowledge'),
          onAction: () =>
            setDismissedAlerts((prev) => new Set(prev).add('flag_declining_trend')),
        });
      }
    }

    // 3. Inactivity notice (no sessions for > 48h)
    if (
      sessions.length > 0 &&
      now - sessions[0].timestamp > 48 * 60 * 60 * 1000 &&
      !dismissedAlerts.has('flag_inactivity')
    ) {
      flags.push({
        id: 'flag_inactivity',
        type: 'inactivity',
        title: t('dashboard.alert.inactivity.title'),
        desc: t('dashboard.alert.inactivity.desc'),
        severity: 'warning',
        actionLabel: t('dashboard.alerts.action.acknowledge'),
        onAction: () => setDismissedAlerts((prev) => new Set(prev).add('flag_inactivity')),
      });
    }

    // 4. Stored alerts from IndexedDB
    storedAlerts
      .filter((a) => !a.acknowledged && !dismissedAlerts.has(`db_${a.id}`))
      .forEach((a) => {
        flags.push({
          id: `db_${a.id}`,
          type: 'custom',
          title: a.rule_triggered,
          desc: a.detail,
          severity: 'warning',
          actionLabel: t('dashboard.alerts.action.acknowledge'),
          onAction: async () => {
            await acknowledgeAlert(a.id);
            setDismissedAlerts((prev) => new Set(prev).add(`db_${a.id}`));
          },
        });
      });

    return flags;
  }, [reminders, sessions, storedAlerts, dismissedAlerts, t]);

  // Sync action (FR-19)
  const handleSyncAll = async () => {
    if (unsyncedSessions.length === 0) return;
    for (const session of unsyncedSessions) {
      await markSessionSynced(session.id);
    }
    setSyncToast(t('dashboard.sync.toast_synced'));
    setTimeout(() => setSyncToast(null), 3500);
    await loadDashboardData();
  };

  // Voice narration summary
  const handleVoiceSummary = () => {
    const alertSummary =
      activeFlags.length > 0
        ? t('dashboard.voice.has_alerts').replace('{count}', activeFlags.length.toString())
        : t('dashboard.voice.no_alerts');

    const speechText = t('dashboard.voice.summary_template')
      .replace('{name}', patient?.name || 'Ratan Bora')
      .replace('{sessions}', totalSessions.toString())
      .replace('{accuracy}', avgAccuracy.toString())
      .replace('{alertSummary}', alertSummary);

    speak(speechText);
  };

  const formatGameTitle = (gameType: string) => {
    if (gameType === 'counting') return t('game.counting.title');
    if (gameType === 'finger_math') return t('game.math.title');
    if (gameType === 'memory_match') return t('game.memory.title');
    return gameType;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => navigate('/')}
            className={styles.backBtn}
            aria-label={t('dashboard.action.back')}
          >
            ← {t('nav.home')}
          </button>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>{t('screen.dashboard.title')}</h1>
            <span className={styles.badge}>{t('dashboard.mode.badge')}</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            onClick={handleVoiceSummary}
            className={styles.voiceBtn}
            aria-label={t('dashboard.action.voice_summary')}
            title={t('dashboard.action.voice_summary')}
          >
            🔊 {t('dashboard.action.voice_summary')}
          </button>
        </div>
      </header>

      {/* Patient Profile & Sync Banner */}
      <section className={styles.profileBanner} aria-label="patient overview">
        <div className={styles.profileInfo}>
          <div className={styles.profileAvatar} aria-hidden="true">
            👴
          </div>
          <div className={styles.profileDetails}>
            <h2>{patient?.name || 'Ratan Bora'}</h2>
            <div className={styles.profileMeta}>
              <span>{t('dashboard.caregiver.label')}: <strong>{caregiver?.name || 'Mousumi Bora'}</strong></span>
              {' • '}
              <span>{t('language.selector.label')}: {language === 'as' ? 'অসমীয়া' : 'English'}</span>
            </div>
          </div>
        </div>

        <div className={styles.syncCard}>
          <div className={styles.syncStatusText}>
            <div className={styles.syncBadge}>
              {unsyncedSessions.length === 0 ? '🟢 ' + t('dashboard.sync.status.synced') : '🟠 ' + t('dashboard.sync.status.pending').replace('{count}', unsyncedSessions.length.toString())}
            </div>
            <div className={styles.syncSub}>
              {lastActivityTime
                ? t('dashboard.sync.last_activity').replace('{time}', lastActivityTime)
                : t('dashboard.sync.storage_type')}
            </div>
          </div>
          {unsyncedSessions.length > 0 && (
            <button onClick={handleSyncAll} className={styles.syncBtn}>
              {t('dashboard.sync.action.sync_now')}
            </button>
          )}
        </div>
      </section>

      {syncToast && <div className={styles.toast}>{syncToast}</div>}

      {/* Navigation Tabs */}
      <nav className={styles.tabs} aria-label="dashboard sections">
        <button
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 {t('dashboard.tab.overview')}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'alerts' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          ⚠️ {t('dashboard.tab.alerts')}
          {activeFlags.length > 0 && (
            <span className={styles.tabBadge}>{activeFlags.length}</span>
          )}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          🕒 {t('dashboard.tab.history')}
        </button>
      </nav>

      {/* Tab 1: Overview & Trends */}
      {activeTab === 'overview' && (
        <main className={styles.mainContent}>
          {/* Metrics Summary */}
          <section className={styles.metricsGrid} aria-label="engagement metrics">
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>🎯</div>
              <div className={styles.metricLabel}>{t('dashboard.metric.total_sessions')}</div>
              <div className={styles.metricValue}>{totalSessions}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>📈</div>
              <div className={styles.metricLabel}>{t('dashboard.metric.avg_accuracy')}</div>
              <div className={styles.metricValue}>{avgAccuracy}%</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>⏱️</div>
              <div className={styles.metricLabel}>{t('dashboard.metric.total_time')}</div>
              <div className={styles.metricValue}>{totalEngagementMinutes} min</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>💊</div>
              <div className={styles.metricLabel}>{t('dashboard.metric.compliance_rate')}</div>
              <div className={styles.metricValue}>{reminderComplianceRate}%</div>
            </div>
          </section>

          {/* Accuracy Trend Overhaul Chart */}
          <section className={styles.card} aria-label="accuracy trend">
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{t('dashboard.chart.accuracy_title')}</h3>
                <p className={styles.cardSubtitle}>{t('dashboard.chart.accuracy_subtitle')}</p>
              </div>

              <div className={styles.filterGroup}>
                <button
                  className={`${styles.filterBtn} ${gameFilter === 'all' ? styles.filterActive : ''}`}
                  onClick={() => setGameFilter('all')}
                >
                  {t('dashboard.chart.filter.all')}
                </button>
                <button
                  className={`${styles.filterBtn} ${gameFilter === 'counting' ? styles.filterActive : ''}`}
                  onClick={() => setGameFilter('counting')}
                >
                  <span>🧮</span>
                  <span>{t('game.counting.title')}</span>
                </button>
                <button
                  className={`${styles.filterBtn} ${gameFilter === 'finger_math' ? styles.filterActive : ''}`}
                  onClick={() => setGameFilter('finger_math')}
                >
                  <span>🖐️</span>
                  <span>{t('game.math.title')}</span>
                </button>
                <button
                  className={`${styles.filterBtn} ${gameFilter === 'memory_match' ? styles.filterActive : ''}`}
                  onClick={() => setGameFilter('memory_match')}
                >
                  <span>🧩</span>
                  <span>{t('game.memory.title')}</span>
                </button>
              </div>
            </div>

            {chartSessions.length === 0 ? (
              <div className={styles.chartEmpty}>{t('dashboard.chart.no_data')}</div>
            ) : (
              <>
                {/* Stats Summary Strip */}
                <div className={styles.chartStatsStrip}>
                  <div className={styles.statPill}>
                    <span>{t('dashboard.chart.stats.latest')}:</span>
                    <strong>{chartStats.latest}%</strong>
                  </div>
                  <span className={styles.statDivider}>•</span>
                  <div className={styles.statPill}>
                    <span>{t('dashboard.chart.stats.peak')}:</span>
                    <strong>{chartStats.peak}%</strong>
                  </div>
                  <span className={styles.statDivider}>•</span>
                  <div className={styles.statPill}>
                    <span>{t('dashboard.chart.stats.total')}:</span>
                    <strong>{chartStats.total}</strong>
                  </div>
                </div>

                {/* Main Graph Grid with Crisp Native Y-Axis */}
                <div className={styles.chartFrame}>
                  {/* Left Column: Crisp HTML Y-Axis Labels */}
                  <div className={styles.yAxisCol} aria-hidden="true">
                    <span className={styles.yAxisLabel}>100%</span>
                    <span className={styles.yAxisLabel}>75%</span>
                    <span className={styles.yAxisLabel}>50%</span>
                    <span className={styles.yAxisLabel}>25%</span>
                    <span className={styles.yAxisLabel}>0%</span>
                  </div>

                  {/* Right Area: SVG Spline Chart */}
                  <div className={styles.svgAreaWrapper}>
                    <svg
                      className={styles.chartSvgNew}
                      viewBox="0 0 800 240"
                      role="img"
                      aria-label="Engagement accuracy trend line chart"
                    >
                      <defs>
                        <linearGradient id="indigoGlowGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.32" />
                          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                        </linearGradient>
                        <filter id="pointGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4f46e5" floodOpacity="0.25" />
                        </filter>
                      </defs>

                      {/* Horizontal Grid lines aligned with Y-axis */}
                      {[20, 65, 110, 155, 200].map((y, idx) => (
                        <line
                          key={idx}
                          x1="10"
                          y1={y}
                          x2="790"
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="1.2"
                          strokeDasharray={idx === 0 || idx === 4 ? 'none' : '4 4'}
                        />
                      ))}

                      {/* Smooth Area & Line Generation */}
                      {(() => {
                        const total = chartSessions.length;
                        const points = chartSessions.map((s, idx) => {
                          const x = total > 1 ? 30 + (idx / (total - 1)) * 740 : 400;
                          // 100% -> y = 20, 0% -> y = 200
                          const y = 200 - s.accuracy * 180;
                          return { x, y, session: s, index: idx + 1 };
                        });

                        const curvedPath = createSmoothCurvedPath(points);
                        const firstPt = points[0];
                        const lastPt = points[points.length - 1];
                        const areaPath = `${curvedPath} L ${lastPt.x.toFixed(1)} 200 L ${firstPt.x.toFixed(1)} 200 Z`;

                        return (
                          <>
                            {/* Gradient Area under the curve */}
                            <path d={areaPath} fill="url(#indigoGlowGradient)" />

                            {/* Main Smooth Spline Line */}
                            <path
                              d={curvedPath}
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Interactive Data Point Circles */}
                            {points.map((p) => {
                              const isSelected = selectedSessionId === p.session.id;
                              return (
                                <g
                                  key={p.session.id}
                                  className={`${styles.chartPointGroup} ${isSelected ? styles.chartPointSelected : ''}`}
                                  onClick={() => setSelectedSessionId(p.session.id)}
                                  filter="url(#pointGlow)"
                                >
                                  {/* Outer glow ring on hover/selection */}
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="8"
                                    className={styles.chartPointOuter}
                                  />
                                  {/* Crisp center dot */}
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="5.5"
                                    className={styles.chartPointCore}
                                  />
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Selected Session Detail Card (Interactive Tooltip) */}
                {activeSession && (
                  <div className={styles.activeSessionCard}>
                    <div className={styles.activeSessionLeft}>
                      <span className={styles.activeSessionIcon}>
                        {GAME_ICON_MAP[activeSession.game_type] || '🎮'}
                      </span>
                      <div>
                        <div className={styles.activeSessionTitle}>
                          {t('dashboard.chart.session_tooltip_title').replace(
                            '{n}',
                            (chartSessions.findIndex((s) => s.id === activeSession.id) + 1).toString()
                          )}
                          {' — '}
                          {formatGameTitle(activeSession.game_type)}
                        </div>
                        <div className={styles.activeSessionTime}>
                          {new Date(activeSession.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                          {' • '}
                          {t('dashboard.history.difficulty').replace('{lvl}', activeSession.difficulty_level.toString())}
                        </div>
                      </div>
                    </div>

                    <div className={styles.activeSessionRight}>
                      <span className={styles.activeScoreBadge}>
                        {Math.round(activeSession.accuracy * 100)}% {activeSession.accuracy >= 0.8 ? '🌟' : activeSession.accuracy >= 0.5 ? '👍' : '💪'}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Session Frequency (Last 7 Days) */}
          <section className={styles.card} aria-label="session frequency">
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{t('dashboard.chart.frequency_title')}</h3>
                <p className={styles.cardSubtitle}>{t('dashboard.chart.frequency_subtitle')}</p>
              </div>
            </div>

            <div className={styles.freqContainer}>
              <div className={styles.freqBarGrid}>
                {frequencyData.map((day, idx) => {
                  const heightPct = Math.max(12, (day.count / maxFreqCount) * 100);
                  return (
                    <div key={idx} className={styles.freqBarCol}>
                      <span className={`${styles.freqCount} ${day.isToday ? styles.freqCountActive : ''}`}>
                        {day.count}
                      </span>
                      <div className={styles.freqTrack}>
                        <div
                          className={`${styles.freqBar} ${day.isToday ? styles.freqBarActive : ''}`}
                          style={{ height: `${heightPct}%` }}
                          title={`${day.label}: ${t('dashboard.chart.sessions_count').replace('{count}', day.count.toString())}`}
                        />
                      </div>
                      <span className={`${styles.freqLabel} ${day.isToday ? styles.freqLabelToday : ''}`}>
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Current Adaptive Difficulty State (FR-5, FR-16) */}
          <section className={styles.card} aria-label="adaptive difficulty">
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{t('dashboard.adaptive.title')}</h3>
                <p className={styles.cardSubtitle}>{t('dashboard.adaptive.subtitle')}</p>
              </div>
            </div>

            <div className={styles.adaptiveGrid}>
              <div className={styles.adaptiveCard}>
                <div className={styles.adaptiveHeader}>
                  <div className={styles.adaptiveGameTitle}>
                    <span>🧮</span>
                    <span>{t('game.counting.title')}</span>
                  </div>
                  <span className={styles.levelBadge}>
                    {t('dashboard.adaptive.level').replace('{level}', countingDiff.toString())}
                  </span>
                </div>
                <div className={styles.levelGauge} aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`${styles.levelDot} ${lvl <= countingDiff ? styles.levelDotFilled : ''}`}
                    />
                  ))}
                </div>
                <div className={styles.adaptiveDesc}>{t('dashboard.adaptive.game.counting_desc')}</div>
              </div>

              <div className={styles.adaptiveCard}>
                <div className={styles.adaptiveHeader}>
                  <div className={styles.adaptiveGameTitle}>
                    <span>🖐️</span>
                    <span>{t('game.math.title')}</span>
                  </div>
                  <span className={styles.levelBadge}>
                    {t('dashboard.adaptive.level').replace('{level}', mathDiff.toString())}
                  </span>
                </div>
                <div className={styles.levelGauge} aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`${styles.levelDot} ${lvl <= mathDiff ? styles.levelDotFilled : ''}`}
                    />
                  ))}
                </div>
                <div className={styles.adaptiveDesc}>{t('dashboard.adaptive.game.math_desc')}</div>
              </div>

              <div className={styles.adaptiveCard}>
                <div className={styles.adaptiveHeader}>
                  <div className={styles.adaptiveGameTitle}>
                    <span>🧩</span>
                    <span>{t('game.memory.title')}</span>
                  </div>
                  <span className={styles.levelBadge}>
                    {t('dashboard.adaptive.level').replace('{level}', memoryDiff.toString())}
                  </span>
                </div>
                <div className={styles.levelGauge} aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`${styles.levelDot} ${lvl <= memoryDiff ? styles.levelDotFilled : ''}`}
                    />
                  ))}
                </div>
                <div className={styles.adaptiveDesc}>{t('dashboard.adaptive.game.memory_desc')}</div>
              </div>
            </div>
          </section>

          {/* Task F Extension Hook Banner */}
          <section className={styles.aiCard} aria-label="ai extension hook">
            <div className={styles.aiContent}>
              <h4>🤖 {t('dashboard.ai.title')}</h4>
              <p>{t('dashboard.ai.desc')}</p>
            </div>
            <span className={styles.aiBadge}>{t('dashboard.ai.badge')}</span>
          </section>
        </main>
      )}

      {/* Tab 2: Caregiver Attention & Alerts */}
      {activeTab === 'alerts' && (
        <main className={styles.mainContent}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{t('dashboard.alerts.section_title')}</h3>
              </div>
            </div>

            {activeFlags.length === 0 ? (
              <div className={styles.alertEmpty}>
                <span>✅</span>
                <span>{t('dashboard.alerts.none')}</span>
              </div>
            ) : (
              <div className={styles.alertsList}>
                {activeFlags.map((flag) => {
                  let alertStyle = styles.alertItemInfo;
                  let icon = 'ℹ️';
                  if (flag.severity === 'warning') {
                    alertStyle = styles.alertItemWarning;
                    icon = '⚠️';
                  } else if (flag.severity === 'critical') {
                    alertStyle = styles.alertItemCritical;
                    icon = '🚨';
                  }

                  return (
                    <div key={flag.id} className={`${styles.alertItem} ${alertStyle}`}>
                      <div className={styles.alertIconArea}>
                        <span className={styles.alertIcon} aria-hidden="true">
                          {icon}
                        </span>
                        <div className={styles.alertText}>
                          <h4>{flag.title}</h4>
                          <p>{flag.desc}</p>
                        </div>
                      </div>

                      {flag.actionLabel && flag.onAction && (
                        <button onClick={flag.onAction} className={styles.alertBtn}>
                          {flag.actionLabel}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Tab 3: Activity History Feed */}
      {activeTab === 'history' && (
        <main className={styles.mainContent}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{t('dashboard.history.title')}</h3>
            </div>

            {sessions.length === 0 ? (
              <div className={styles.chartEmpty}>{t('dashboard.history.empty')}</div>
            ) : (
              <div className={styles.historyList}>
                {sessions.map((sess) => {
                  const icon = GAME_ICON_MAP[sess.game_type] || '🎮';
                  const title = formatGameTitle(sess.game_type);
                  const timeStr = new Date(sess.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short',
                  });
                  const accPct = Math.round(sess.accuracy * 100);
                  const durSec = Math.round((sess.duration_ms || 0) / 1000);

                  let accStyle = styles.accHigh;
                  if (accPct < 50) accStyle = styles.accLow;
                  else if (accPct < 80) accStyle = styles.accMed;

                  return (
                    <div key={sess.id} className={styles.historyItem}>
                      <div className={styles.historyMain}>
                        <span className={styles.historyIcon} aria-hidden="true">
                          {icon}
                        </span>
                        <div>
                          <div className={styles.historyTitle}>{title}</div>
                          <div className={styles.historyTime}>{timeStr}</div>
                        </div>
                      </div>

                      <div className={styles.historyMeta}>
                        <span className={styles.historyTime}>
                          {t('dashboard.history.duration').replace('{sec}', durSec.toString())}
                        </span>
                        <span className={styles.historyTime}>
                          {t('dashboard.history.difficulty').replace('{lvl}', sess.difficulty_level.toString())}
                        </span>
                        <span className={`${styles.accBadge} ${accStyle}`}>
                          {accPct}%
                        </span>
                        <span className={styles.syncMiniBadge}>
                          {sess.synced ? '☁️ ' + t('dashboard.history.synced') : '📱 ' + t('dashboard.history.local')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
