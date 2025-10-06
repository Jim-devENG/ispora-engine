// This file now simply imports and exports ForgeLab for backward compatibility
import { ForgeLab } from './ForgeLab';

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  role: string;
  status: string;
  progress: number;
  isOnline?: boolean;
  email?: string;
  skills?: string[];
}

// Export InnovationHub as an alias to ForgeLab for backward compatibility
export function InnovationHub(props: { mentee: ProjectMember; projectType?: string }) {
  return <ForgeLab {...props} />;
}

// Also export as default for any default imports
export default InnovationHub;
