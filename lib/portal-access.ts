import type { PortalRole } from '@/lib/portal-types';

export type PortalCapability =
  | 'manageJobs'
  | 'archiveJobs'
  | 'viewApplications'
  | 'manageApplications'
  | 'editContent'
  | 'manageMedia';

export const roleCapabilities: Record<PortalRole, Record<PortalCapability, boolean>> = {
  owner: {
    manageJobs: true,
    archiveJobs: true,
    viewApplications: true,
    manageApplications: true,
    editContent: true,
    manageMedia: true,
  },
  editor: {
    manageJobs: true,
    archiveJobs: true,
    viewApplications: false,
    manageApplications: false,
    editContent: true,
    manageMedia: true,
  },
  recruiter: {
    manageJobs: false,
    archiveJobs: false,
    viewApplications: true,
    manageApplications: true,
    editContent: false,
    manageMedia: false,
  },
};

export function isPortalRole(value: string): value is PortalRole {
  return value === 'owner' || value === 'editor' || value === 'recruiter';
}

export function can(role: PortalRole, capability: PortalCapability) {
  return roleCapabilities[role][capability];
}
