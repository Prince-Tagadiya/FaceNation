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

export type CaseType = 'Missing Person' | 'High-Value Suspect' | 'Criminal Record';
export type CaseStatus = 'Active' | 'Closed';

export interface Case {
  uid: string;
  type: CaseType;
  status: CaseStatus;
  subjectName: string;
  subjectId?: string; // Link to a Citizen User UID
  assignedOfficerId: string;
  description: string;
  createdAt: string; // ISO String or Firestore Timestamp converted
  lastUpdated: string;
}

export type AlertStatus = 'New' | 'Acknowledged';

export interface Alert {
  uid: string;
  caseId: string;
  officerId: string;
  confidence: number;
  status: AlertStatus;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface AuditLog {
  id: string;
  action: string; // e.g., 'CREATE_USER', 'DELETE_USER', 'SYSTEM_WIPE'
  target: string; // Details about the target (e.g., 'User: john@doe.com')
  adminId: string;
  adminName: string;
  adminRole?: string;
  timestamp: string; // ISO String
  details?: string;
}

export interface SystemSettings {
  confidenceThreshold: number;
  caseExpiryDays: number;
  updatedAt: string;
  updatedBy: string;
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface DashboardAlert {
  id: string;
  timestamp: string;
  type: string;
  location: string;
  severity: AlertSeverity;
  message: string;
  status: 'active' | 'acknowledged' | 'assigned' | 'resolved';
  imageUrl?: string;
  assignedTo?: string;
  lat?: number;
  lng?: number;
}