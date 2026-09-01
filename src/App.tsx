/**
 * App.tsx — Root routing for Sarothi.
 *
 * HOW TO ADD A NEW SCREEN (for Tasks B/C/D/E/F):
 *   1. Create src/screens/YourScreen/index.tsx
 *   2. Import the component here
 *   3. Add a <Route path="/your-path" element={<YourScreen />} /> inside <Routes>
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomeScreen } from '@/screens/Home';
import { PlayScreen } from '@/screens/Play';
import { ObjectCountingGame } from '@/games/counting';
import { FingerMathGame } from '@/games/fingerMath';
import { RemindersScreen } from '@/screens/Reminders';
import { ProgressScreen } from '@/screens/Progress';
import { CaregiverDashboardScreen } from '@/screens/CaregiverDashboard';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/play/counting" element={<ObjectCountingGame />} />
        <Route path="/play/finger-math" element={<FingerMathGame />} />
        <Route path="/reminders" element={<RemindersScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/caregiver" element={<CaregiverDashboardScreen />} />
        <Route path="/dashboard" element={<CaregiverDashboardScreen />} />
        {/* Catch-all — redirect to home */}
        <Route path="*" element={<HomeScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
