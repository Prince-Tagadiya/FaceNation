import { Section } from './types';

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