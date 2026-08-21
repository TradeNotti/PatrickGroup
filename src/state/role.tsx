import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type RoleLabel = 'Owner' | 'Manager';

interface RoleContextValue {
  role: RoleLabel;
  canEdit: boolean;
}

const RoleContext = createContext<RoleContextValue>({ role: 'Owner', canEdit: false });

// Owners get full visibility but can't record data — only Managers can.
// This is a UI-level mode (there's one shared login, not per-person
// accounts), meant to stop accidental edits while reviewing, not a
// security boundary.
export function RoleProvider({ role, children }: { role: RoleLabel; children: ReactNode }) {
  return <RoleContext.Provider value={{ role, canEdit: role === 'Manager' }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
