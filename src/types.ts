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