export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';
export type ApplicationStatus = 'new' | 'reviewing' | 'contacted' | 'interview' | 'hired' | 'rejected' | 'archived';
export type PortalRole = 'owner' | 'editor' | 'recruiter';

export type JobRecord = {
  id: string;
  slug: string;
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
  descriptionEs: string;
  descriptionEn: string;
  requirementsEs: string;
  requirementsEn: string;
  location: string;
  shift: string;
  employmentType: string;
  payMin: number | null;
  payMax: number | null;
  payUnit: string;
  openings: number;
  status: JobStatus;
  featured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  closesAt: string | null;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
};

export type PublicJob = JobRecord & {
  applicationCount?: number;
};

export type ApplicationRecord = {
  id: string;
  reference: string;
  jobId: string | null;
  jobTitle: string | null;
  roleInterest: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  availability: string;
  message: string;
  resumeFilename: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  altEs: string;
  altEn: string;
  url: string;
  createdAt: string;
};

export type SiteSettings = {
  heroLine1Es: string;
  heroAccentEs: string;
  heroLine2Es: string;
  heroLeadEs: string;
  heroLine1En: string;
  heroAccentEn: string;
  heroLine2En: string;
  heroLeadEn: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  heroMediaId: string | null;
  transportMediaId: string | null;
  operationsMediaId: string | null;
  heroImageUrl: string | null;
  transportImageUrl: string | null;
  operationsImageUrl: string | null;
  updatedAt: string;
};

export type PortalSnapshot = {
  tenant: { id: string; name: string; slug: string };
  user: { userId: string; email: string; displayName: string; role: PortalRole; localPreview: boolean };
  jobs: JobRecord[];
  applications: ApplicationRecord[];
  settings: SiteSettings;
  media: MediaAsset[];
  capabilities: Record<import('@/lib/portal-access').PortalCapability, boolean>;
  metrics: {
    activeJobs: number;
    draftJobs: number;
    newApplications: number;
    totalApplications: number;
  };
};
