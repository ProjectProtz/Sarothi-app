/** Progress screen placeholder — Task E (and Task B for session data) will replace this. */
import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export function ProgressScreen() {
  return (
    <PlaceholderScreen
      titleKey="screen.progress.title"
      detailKey="placeholder.taske"
      icon="📈"
    />
  );
}
