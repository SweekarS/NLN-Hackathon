export interface Task {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  duration?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  enabled: boolean;
}
