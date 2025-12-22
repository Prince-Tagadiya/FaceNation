import { Section, DashboardAlert } from './types';

export const SECTIONS: Section[] = [
  {
    id: "hero",
    title: "IDENTITY. ACCOUNTABILITY. REIMAGINED.",
    subtitle: "SYSTEM INITIALIZED",
    description: "FaceNation is the architectural backbone for next-generation biometric compliance. Identity begins with a face.",
    align: 'center',
    phase: 0
  },
  {
    id: "capture",
    title: "BIOMETRIC LANDMARKING",
    subtitle: "PHASE 1: INGESTION",
    description: "Our neural engine maps 128 distinct facial landmarks, converting organic features into immutable data points. It is not an image; it is a mathematical signature.",
    align: 'left',
    phase: 1
  },
  {
    id: "vault",
    title: "SECURE IDENTITY VAULT",
    subtitle: "PHASE 2: ENCRYPTION",
    description: "The biometric signature is encapsulated in a SHA-512 encrypted container. Identity data is never stored raw; it is transformed into a secure digital asset.",
    align: 'right',
    phase: 2
  },
  {
    id: "verify",
    title: "INSTANT VERIFICATION",
    subtitle: "LAW ENFORCEMENT PROTOCOL",
    description: "Authorized personnel access a binary verification state. No browsing, no surveillance feed—only 'Verified' or 'Unverified' status responses.",
    align: 'left',
    phase: 3
  },
  {
    id: "compliance",
    title: "OBJECT-LINKED RESPONSIBILITY",
    subtitle: "TRAFFIC & VIOLATION",
    description: "Violations are linked to the individual, not the vehicle. The system ensures accountability travels with the person.",
    align: 'right',
    phase: 4
  },
  {
    id: "status",
    title: "STATUS TRACKING",
    subtitle: "REAL-TIME AUDIT",
    description: "A continuous, immutable ledger tracks compliance status. From green to red, every state change is cryptographically signed.",
    align: 'left',
    phase: 5
  },
  {
    id: "privacy",
    title: "ETHICAL DISSOLUTION",
    subtitle: "PRIVACY BY DESIGN",
    description: "Data exists only when needed. Upon session termination or consent withdrawal, the biometric keys dissolve. No ghosts in the machine.",
    align: 'center',
    phase: 6
  },
  {
    id: "cta",
    title: "ARCHITECT THE FUTURE",
    subtitle: "JOIN THE PILOT",
    description: "Explore the technical documentation and view the ethical compliance whitepaper.",
    align: 'center',
    phase: 7
  }
];

export const NAV_LINKS = [
  { name: 'Architecture', href: '#capture' },
  { name: 'Security', href: '#vault' },
  { name: 'Compliance', href: '#compliance' },
  { name: 'Ethics', href: '#privacy' },
];

export const MOCK_ALERTS: DashboardAlert[] = [
  { id: '1', timestamp: new Date().toISOString(), type: 'Face Match', location: 'Central Station', severity: 'critical', message: 'Target "Subject 89" identified at Platform 3.', status: 'active', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?px=250', lat: 51.505, lng: -0.09 },
  { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'Perimeter Breach', location: 'Sector 4', severity: 'high', message: 'Unauthorized entry detected at North Gate.', status: 'active', lat: 51.51, lng: -0.1 },
  { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'Loitering', location: 'Shopping Mall Entrance', severity: 'medium', message: 'Group detected loitering > 10 mins.', status: 'acknowledged', lat: 51.49, lng: -0.08 },
  { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: 'Object Left Behind', location: 'Airport Terminal 1', severity: 'low', message: 'Unattended bag detected near check-in.', status: 'resolved', lat: 51.508, lng: -0.11 },
  { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: 'Face Match', location: 'City Park', severity: 'critical', message: 'Match 98% with "Missing Person" DB.', status: 'active', imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?px=250', lat: 51.515, lng: -0.09 },
];

export const MOCK_OFFICERS = [
  { id: 'off1', name: 'Officer John Doe', lat: 51.506, lng: -0.091 },
  { id: 'off2', name: 'Officer Jane Smith', lat: 51.511, lng: -0.101 },
  { id: 'off3', name: 'Officer Mike Ross', lat: 51.492, lng: -0.082 },
  { id: 'off4', name: 'Officer Sarah Connor', lat: 51.509, lng: -0.111 },
];