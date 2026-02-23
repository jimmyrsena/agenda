import { useLocalStorage } from './useLocalStorage';

interface MentorConfig {
  userName: string;
  voiceSpeed: number;
  voicePersona: string;
}

const DEFAULT_CONFIG: MentorConfig = {
  userName: "Johan",
  voiceSpeed: 1.0,
  voicePersona: "formal",
};

export function useUserName(): string {
  const [config] = useLocalStorage<MentorConfig>('mentor-config', DEFAULT_CONFIG);
  return config.userName || 'Estudante';
}
