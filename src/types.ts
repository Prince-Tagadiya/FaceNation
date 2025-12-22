import { ReactNode } from 'react';

export interface ChildrenProps {
  children: ReactNode;
}

export interface MagneticProps extends ChildrenProps {
  strength?: number; 
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  align: 'left' | 'right' | 'center';
  phase: number; // Used for 3D synchronization
}

export type SceneState = 'face' | 'vault' | 'network' | 'privacy' | 'cta';

export type UserRole = 
  | 'System Admin'
  | 'Investigating Officer' 
  | 'Control Room Operator' 
  | 'Citizen';

export interface UserData {
  uid: string;
  email: string | null;
  role: UserRole;
  name: string;
  active: boolean;
  createdAt: string;
  createdBy?: string; // UID of the admin who created this user
  tempPassword?: string;
}