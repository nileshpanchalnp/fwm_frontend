// src/api/client.ts
// https://client.sattvion.com/fwm
// http://localhost:5000

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PUBLIC_PATHS = [
  '/courses',
  '/auth/login',
  '/auth/register',
  '/auth/me',
  '/auth/logout',
  '/faqs',
  '/contact',
];

const NO_REDIRECT_PAGES = ['/login', '/register'];

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      const isPublicPath = PUBLIC_PATHS.some(p => path.startsWith(p));
      const normalizedPath = window.location.pathname.replace(/^\/fwm/, '');
      const isOnAuthPage = NO_REDIRECT_PAGES.some(p => normalizedPath.startsWith(p));
      if (!isPublicPath && !isOnAuthPage) {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/fwm/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('/auth/me'),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// ── Courses ───────────────────────────────────────────────────
export const courseApi = {
  getAll:      () => request<{ courses: Course[] }>('/courses'),
  getBySlug:   (slug: string) => request<{ course: CourseDetail }>(`/courses/${slug}`),
  adminGetAll: () => request<{ courses: Course[] }>('/courses/admin/all'),
  create:      (body: Partial<CourseDetail>) =>
    request('/courses/admin/create', { method: 'POST', body: JSON.stringify(body) }),
  update:      (id: number, body: Partial<CourseDetail>) =>
    request(`/courses/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:      (id: number) => request(`/courses/admin/${id}`, { method: 'DELETE' }),
};

// ── Enrollments ───────────────────────────────────────────────
export const enrollmentApi = {
  submit: (course_id: number, transaction_id: string, user_id: number) =>
    request('/enrollments', { method: 'POST', body: JSON.stringify({ course_id, transaction_id, user_id }) }),
  my: () => request<{ enrollments: Enrollment[] }>('/enrollments/my'),
  check: (courseId: number) =>
    request<{ enrolled: boolean; status: string; expires_at: string }>(`/enrollments/check/${courseId}`),
  markProgress: (topic_id: number, completed: boolean) =>
    request('/enrollments/progress', { method: 'POST', body: JSON.stringify({ topic_id, completed }) }),
  getProgress: (courseId: number) =>
    request<{ progress: { topic_id: number; completed: number }[] }>(`/enrollments/progress/${courseId}`),
};

// ── Unit Tests ────────────────────────────────────────────────
export const unitTestApi = {
  get: (unitId: number) =>
    request<{ test: UnitTest | null }>(`/unit-tests/${unitId}`),
  submit: (unitId: number, answers: Record<number, string>) =>
    request<{ score: number; total: number; results: Record<number, TestResult> }>(
      `/unit-tests/${unitId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }
    ),
  upsert: (unitId: number, body: { title: string; questions: TestQuestion[] }) =>
    request(`/unit-tests/${unitId}/admin`, { method: 'POST', body: JSON.stringify(body) }),
  delete: (unitId: number) =>
    request(`/unit-tests/${unitId}/admin`, { method: 'DELETE' }),
};

// ── Writing Notes ─────────────────────────────────────────────
export const writingApi = {
  get:  () => request<{ content: string }>('/writing'),
  save: (content: string) =>
    request('/writing', { method: 'POST', body: JSON.stringify({ content }) }),
};

// ── FAQs ──────────────────────────────────────────────────────
export const faqApi = {
  getAll: () => request<{ faqs: Faq[] }>('/faqs'),
  create: (body: Partial<Faq>) =>
    request('/faqs', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<Faq>) =>
    request(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) =>
    request(`/faqs/${id}`, { method: 'DELETE' }),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  getEnrollments: (status?: string) =>
    request<{ enrollments: EnrollmentAdmin[] }>(`/admin/enrollments${status ? `?status=${status}` : ''}`),
  approve: (id: number) => request(`/admin/enrollments/${id}/approve`, { method: 'PUT' }),
  reject:  (id: number) => request(`/admin/enrollments/${id}/reject`,  { method: 'PUT' }),
  getStats: () => request<{ stats: AdminStats }>('/admin/stats'),
  getUsers: () => request<{ users: User[] }>('/admin/users'),
};

// ── Contact ───────────────────────────────────────────────────
export const contactApi = {
  submit: (body: ContactSubmitBody) =>
    request<{ message: string; id: number }>('/contact', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getAll: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    if (params?.search?.trim()) qs.set('search', params.search.trim());
    const query = qs.toString() ? `?${qs}` : '';
    return request<{ submissions: ContactSubmission[] }>(`/contact${query}`);
  },
  getStats: () =>
    request<{ stats: ContactStats }>('/contact/stats'),
  updateStatus: (id: number, body: { status?: ContactSubmission['status']; admin_note?: string }) =>
    request(`/contact/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: number) =>
    request(`/contact/${id}`, { method: 'DELETE' }),
};

// ── Mock Tests ────────────────────────────────────────────────
export const mockTestApi = {
  getCourseTest: (courseId: number) =>
    request<{ mockTest: MockTestInfo | null; attempts: AttemptAttempt[]; attempts_left: number; has_passed: boolean }>(
      `/mock-tests/course/${courseId}`
    ),
  startExam: (mockTestId: number) =>
    request<{ attemptId: number; questions: MockQuestion[]; test: MockTestInfo }>(
      `/mock-tests/${mockTestId}/start`, { method: 'POST' }
    ),
  submitExam: (attemptId: number, answers: Record<number, string>) =>
    request<ExamResult>(`/mock-tests/attempt/${attemptId}/submit`, {
      method: 'POST', body: JSON.stringify({ answers })
    }),
  abandonExam: (attemptId: number, answers: Record<number, string>) =>
    request(`/mock-tests/attempt/${attemptId}/abandon`, {
      method: 'POST', body: JSON.stringify({ answers })
    }),
  getCertificates: () =>
    request<{ certificates: CertificateData[] }>('/mock-tests/certificates'),
  adminCourses:    () => request<{ courses: any[] }>('/mock-tests/admin/courses'),
  adminGetTest:    (courseId: number) => request<{ mockTest: any }>(`/mock-tests/admin/course/${courseId}`),
  adminSaveTest:   (courseId: number, body: any) =>
    request(`/mock-tests/admin/course/${courseId}`, { method: 'POST', body: JSON.stringify(body) }),
  adminDeleteTest: (courseId: number) =>
    request(`/mock-tests/admin/course/${courseId}`, { method: 'DELETE' }),
  adminStats:      (mockTestId: number) =>
    request<{ attempts: any[] }>(`/mock-tests/admin/stats/${mockTestId}`),
};

// ── Types ─────────────────────────────────────────────────────
export interface User {
  id: number; name: string; email: string; role: 'user' | 'admin';
  status?: string; created_at: string;
}

export interface Course {
  id: number; slug: string; title: string; subtitle: string; level: string;
  price: number; original_price: number; rating: number; students: number;
  hours: number; duration_days: number;
  revision_days: number | null;   // null means no revision period
  is_active: number; features: string[];
}

export interface UnitTopic {
  id: number; unit_id: number; title: string;
  youtube_id: string; pdf_url?: string; exercise_youtube_id?: string;
  sort_order: number;
}

export interface CourseUnit {
  id: number; course_id: number; unit_type: 'reading' | 'listening' | 'revision';
  unit_label: string; unit_title: string; sort_order: number; topics: UnitTopic[];
}

export interface CourseDetail extends Course {
  description: string; whatYouLearn: string[]; includes: string[];
  curriculum: CourseUnit[];           // reading units
  listeningCurriculum: CourseUnit[];  // listening units
  revisionCurriculum: CourseUnit[];   // revision units (shown only during revision phase)
}

export interface Enrollment {
  id: number; user_id: number; course_id: number; transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  expires_at: string | null;
  enrolled_at: string;              // ← needed for revision window calculation
  title: string; slug: string; level: string;
  duration_days: number;
  revision_days: number | null;     // joined from courses table
}

export interface EnrollmentAdmin extends Enrollment {
  user_name: string; user_email: string; course_title: string; course_slug: string;
}

export interface AdminStats {
  total_users: number; total_courses: number; pending: number; approved: number; rejected: number;
}

export interface TestQuestion {
  id?: number; question: string; audio_url?: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct?: 'a' | 'b' | 'c' | 'd';
}

export interface UnitTest {
  id: number; unit_id: number; title: string; questions: TestQuestion[];
}

export interface TestResult {
  correct: string; userAnswer: string; isCorrect: boolean;
}

export interface Faq {
  id: number; question: string; answer: string; sort_order: number; is_active: number;
}

export interface ContactSubmitBody {
  name: string; phone: string; email: string; course?: string; message?: string;
}

export interface ContactSubmission {
  id: number; name: string; phone: string; email: string;
  course: string | null; message: string | null;
  status: 'new' | 'contacted' | 'enrolled' | 'closed';
  admin_note: string | null; submitted_at: string; updated_at: string;
}

export interface ContactStats {
  new: number; contacted: number; enrolled: number; closed: number; total: number;
}

export interface MockTestInfo {
  id: number; title: string; description: string;
  total_marks: number; pass_marks: number;
  max_attempts: number; duration_mins: number;
}

export interface MockQuestion {
  id: number; section: 'reading' | 'listening' | 'writing';
  question_text: string; audio_url: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: string; marks: number;
}

export interface AttemptAttempt {
  id: number; attempt_number: number; score: number;
  total_marks: number; passed: number; status: string; completed_at: string;
}

export interface ExamResult {
  score: number; total_marks: number; pass_marks: number; passed: boolean;
  total_questions: number; correct_count: number; wrong_count: number;
  section_stats: Record<string, { correct: number; wrong: number }>;
  certificate: CertificateData | null;
}

export interface CertificateData {
  id: number; certificate_no: string; score: number; total_marks: number;
  course_title: string; course_level: string; user_name: string;
  exam_title: string; issued_at: string;
  course_id?: number;
}

// ─────────────────────────────────────────────────────────────
// ACCESS PHASE HELPERS
// Single source of truth for all access checks.
//
// KEY CHANGE: Both `expires_at` AND the revision window are computed
// from `enrolled_at` (enrollment start), NOT chained from each other.
//
//   - Course access window  = enrolled_at  →  enrolled_at + duration_days
//     (this is what `expires_at` already stores in the DB)
//   - Revision window       = enrolled_at  →  enrolled_at + revision_days
//
// So if duration_days=60 and revision_days=100:
//   - Course expires at:    enrolled_at + 60 days
//   - Revision ends at:     enrolled_at + 100 days
//   - Overlap (day 60→100): revision phase
//   - After day 100:        expired
//
// If revision_days <= duration_days, revision window ends before/with
// course expiry, so there is effectively no visible revision phase.
// ─────────────────────────────────────────────────────────────

/** Number of grace days granted after cert is earned. */
export const CERT_GRACE_DAYS = 3;

export type AccessPhase =
  | 'active'      // within enrollment window, no cert yet (or no expiry)
  | 'cert_grace'  // cert earned, grace period still running
  | 'revision'    // course expired, revision window still open
  | 'expired';    // everything over

export interface AccessInfo {
  /** Current access phase. */
  phase: AccessPhase;
  /** When the current phase ends (null = never expires). */
  phaseEndsAt: Date | null;
  /** Days remaining in current phase (0 = last day). */
  daysLeft: number | null;
  /** Whether the student can access reading/listening content tabs. */
  canAccessContent: boolean;
  /** Whether the student can access writing + certificates tab. */
  canAccessWritingAndCerts: boolean;
  /** Whether the revision curriculum tab should be shown. */
  showRevision: boolean;
}

/**
 * Compute access phase for an enrollment.
 *
 * @param enrollmentExpiresAt  - The `expires_at` stored in DB
 *                               (= enrolled_at + duration_days, set by admin approval)
 * @param certIssuedAt         - ISO string of when the cert was issued, or null
 * @param revisionDays         - From `courses.revision_days`; null = no revision
 * @param enrolledAt           - The `enrolled_at` stored in DB (enrollment start date).
 *                               Used to compute the revision window independently.
 *
 * Phase resolution (first match wins):
 *  1. Cert grace active  → 'cert_grace'
 *  2. Enrollment still live (or no expiry)  → 'active'
 *  3. Revision window still open  → 'revision'
 *  4. Everything over  → 'expired'
 */
export function computeAccessInfo(
  enrollmentExpiresAt: string | null,
  certIssuedAt: string | null,
  revisionDays: number | null,
  enrolledAt?: string | null,   // ← NEW optional param (backwards-compatible)
): AccessInfo {
  const now = new Date();

  // ── Cert grace end ──────────────────────────────────────────
  const certGraceEnd: Date | null = certIssuedAt
    ? (() => { const d = new Date(certIssuedAt); d.setDate(d.getDate() + CERT_GRACE_DAYS); return d; })()
    : null;

  // ── Enrollment expiry ───────────────────────────────────────
  const enrollExpiry: Date | null = enrollmentExpiresAt
    ? new Date(enrollmentExpiresAt)
    : null;

  // ── Revision window end ─────────────────────────────────────
  // Revision is counted from enrolled_at (enrollment start), NOT from expiry.
  // This means both the course window and revision window start together.
  //
  // If enrolledAt is not supplied (legacy call sites), fall back to the old
  // behaviour of adding revision_days on top of expires_at so nothing breaks.
  const revisionEnd: Date | null = (() => {
    if (!revisionDays || revisionDays <= 0) return null;

    if (enrolledAt) {
      // ✅ Correct: revision window from enrollment start
      const d = new Date(enrolledAt);
      d.setDate(d.getDate() + revisionDays);
      return d;
    } else if (enrollExpiry) {
      // Legacy fallback: add on top of expiry (old behaviour)
      const d = new Date(enrollExpiry);
      d.setDate(d.getDate() + revisionDays);
      return d;
    }
    return null;
  })();

  // ── Helper ──────────────────────────────────────────────────
  const daysUntil = (d: Date) =>
    Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // ── Phase resolution ────────────────────────────────────────

  // 1. CERT GRACE: cert earned and grace period still active
  if (certGraceEnd && certGraceEnd > now) {
    return {
      phase: 'cert_grace',
      phaseEndsAt: certGraceEnd,
      daysLeft: daysUntil(certGraceEnd),
      canAccessContent: true,
      canAccessWritingAndCerts: true,
      showRevision: false,
    };
  }

  // 2a. ACTIVE: no cert yet, enrollment still live
  if (!certGraceEnd && enrollExpiry && enrollExpiry > now) {
    return {
      phase: 'active',
      phaseEndsAt: enrollExpiry,
      daysLeft: daysUntil(enrollExpiry),
      canAccessContent: true,
      canAccessWritingAndCerts: true,
      showRevision: false,
    };
  }

  // 2b. ACTIVE: no expiry set — lifetime enrollment
  if (!certGraceEnd && !enrollExpiry) {
    return {
      phase: 'active',
      phaseEndsAt: null,
      daysLeft: null,
      canAccessContent: true,
      canAccessWritingAndCerts: true,
      showRevision: false,
    };
  }

  // 3. REVISION: course/cert-grace expired but revision window still open.
  //    revisionEnd was calculated from enrolled_at + revision_days, so if
  //    revision_days > duration_days the window extends past course expiry.
  if (revisionEnd && revisionEnd > now) {
    return {
      phase: 'revision',
      phaseEndsAt: revisionEnd,
      daysLeft: daysUntil(revisionEnd),
      canAccessContent: false,        // no reading/listening in revision
      canAccessWritingAndCerts: true, // writing + certs always available
      showRevision: true,             // show revision curriculum tab
    };
  }

  // 4. EXPIRED: everything over
  return {
    phase: 'expired',
    phaseEndsAt: revisionEnd ?? certGraceEnd ?? enrollExpiry,
    daysLeft: null,
    canAccessContent: false,
    canAccessWritingAndCerts: true,  // always accessible even after expiry
    showRevision: false,
  };
}