// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  adminApi, courseApi, contactApi,
  AdminStats, Course
} from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Users, BookOpen, Clock, CheckCircle2, LogOut, Plus,
  Edit3, Trash2,  Menu, X, RefreshCw,
  Globe, FlaskConical, MessageSquare, HelpCircle, Inbox
} from 'lucide-react';
import CourseForm from './CourseForm';
import AdminMockTestTab from './tabs/AdminMockTestTab';
import EnrollmentTab from './tabs/EnrollmentTab';
import ContactManager from './tabs/ContactManager';
import FaqManager from './tabs/FaqManager';
import StatCard from '../../components/ui/StatCard';
import Pagination, { PAGE_SIZE } from '../../components/ui/Pagination';
import Company_Logo from '../../img/sattvion_logo_two.png';

type AdminView = 'enrollments' | 'courses' | 'contacts' | 'faqs' | 'mocktests';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setView]                   = useState<AdminView>('enrollments');
  const [stats, setStats]                 = useState<AdminStats | null>(null);
  const [courses, setCourses]             = useState<Course[]>([]);
  const [loading, setLoading]             = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourse, setEditCourse]       = useState<Course | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [contactNewCount, setContactNewCount] = useState(0);
  const [coursePage, setCoursePage]       = useState(1);
  // ── CHANGED: track pending writing grading count from MockTestTab ──
  const [mockPendingCount, setMockPendingCount] = useState(0);

  useEffect(() => { fetchStats(); fetchContactBadge(); fetchMockPendingBadge(); }, []);
  useEffect(() => {
    if (view === 'courses') { fetchCourses(); setCoursePage(1); }
  }, [view]);

  const fetchContactBadge = async () => {
    try { const data = await contactApi.getStats(); setContactNewCount(data.stats?.new || 0); } catch { }
  };
  // fetch mock pending count on mount so sidebar badge shows immediately
  const fetchMockPendingBadge = async () => {
    try {
      const BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${BASE}/mock-tests/admin/courses`, { credentials: "include" });
      const data = await res.json();
      const rows = data.courses || [];
      const pending = rows.reduce((s: number, c: any) => s + (c.pending_review_count || 0), 0);
      setMockPendingCount(pending);
    } catch {}
  };
  const fetchStats = async () => { const d = await adminApi.getStats(); setStats(d.stats); };
  const fetchCourses = async () => { setLoading(true); const d = await courseApi.adminGetAll(); setCourses(d.courses); setLoading(false); };
  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Deactivate this course?')) return;
    await courseApi.delete(id);
    fetchCourses();
  };

  if (showCourseForm || editCourse) {
    return (
      <CourseForm
        course={editCourse}
        onSave={() => { setShowCourseForm(false); setEditCourse(null); fetchCourses(); }}
        onCancel={() => { setShowCourseForm(false); setEditCourse(null); }}
      />
    );
  }

  const pagedCourses = courses.slice((coursePage - 1) * PAGE_SIZE, coursePage * PAGE_SIZE);

  const navGroups = [
    {
      label: 'MAIN',
      items: [
        { id: 'enrollments', label: 'Inbox',         icon: <Inbox className="w-4 h-4" />,       badge: stats?.pending },
        { id: 'contacts',    label: 'Contact Leads', icon: <MessageSquare className="w-4 h-4" />, badge: contactNewCount || undefined },
      ],
    },
    {
      label: 'COURSES',
      items: [
        { id: 'courses',   label: 'All Courses', icon: <BookOpen className="w-4 h-4" />,    badge: undefined },
        // ── CHANGED: use mockPendingCount as badge on Mock Tests nav item ──
        { id: 'mocktests', label: 'Mock Tests',  icon: <FlaskConical className="w-4 h-4" />, badge: mockPendingCount || undefined },
      ],
    },
    {
      label: 'CONTENT',
      items: [
        { id: 'faqs', label: 'FAQ Manager', icon: <HelpCircle className="w-4 h-4" />, badge: undefined },
      ],
    },
    {
      label: 'QUICK LINKS',
      items: [
        { id: 'site', label: 'View Website', icon: <Globe className="w-4 h-4" />, badge: undefined },
      ],
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="px-5 py-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-none truncate">{user?.name || 'Admin'}</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          title="Sign Out"
          className="flex-shrink-0 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 px-3 py-2 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-slate-500 text-[10px] font-bold tracking-widest px-3 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = view === item.id;
                const handleClick = () => {
                  if (item.id === 'site') { navigate('/'); return; }
                  setView(item.id as AdminView);
                  setSidebarOpen(false);
                  if (item.id === 'contacts') fetchContactBadge();
                };
                return (
                  <button key={item.id} onClick={handleClick}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                      ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-center text-slate-500 text-[10px] leading-relaxed px-1">
          Powered by&nbsp;
          <a href="https://digi.sattvion.com/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-slate-300 hover:text-sky-400 transition-colors">
            Sattvion Digi Solutions
            <motion.img
              src={Company_Logo}
              alt="Sattvion"
              className="h-4 w-auto object-contain"
              animate={{ scale: [1, 1.25, 1, 1.2, 1] }}
              transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, times: [0, 0.14, 0.28, 0.42, 0.56] }}
            />
          </a>
        </p>
      </div>
    </div>
  );

  const pageTitles: Record<AdminView, { title: string; sub: string }> = {
    enrollments: { title: 'Enrollment Inbox',    sub: 'Review and approve student enrollment requests' },
    courses:     { title: 'Course Management',   sub: 'Manage your course catalog' },
    contacts:    { title: 'Contact Leads',        sub: 'All contact form submissions from the website' },
    faqs:        { title: 'FAQ Manager',          sub: 'Manage student FAQs shown on the dashboard' },
    mocktests:   { title: 'Mock Tests',           sub: 'Configure and grade mock tests' },
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-col flex-shrink-0" style={{ background: '#1a2332' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-56 flex flex-col z-30 shadow-2xl transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: '#1a2332' }}>
        <div className="flex justify-end px-4 pt-4">
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-500 hover:text-gray-700 p-1" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{pageTitles[view].title}</h1>
              <p className="text-xs text-gray-400">{pageTitles[view].sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === 'courses' && (
              <button onClick={() => setShowCourseForm(true)}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm">
                <Plus className="w-4 h-4" /> Add Course
              </button>
            )}
            {view === 'courses' && (
              <button onClick={() => fetchCourses()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold px-3 py-2.5 rounded-xl">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Pending"     value={stats.pending}       sub="Needs attention"  icon={<Clock className="w-5 h-5" />}       iconBg="bg-amber-50"   iconColor="text-amber-500"   decorBg="bg-amber-100"   />
              <StatCard label="Approved"    value={stats.approved}      sub="Reviewed"         icon={<CheckCircle2 className="w-5 h-5" />} iconBg="bg-emerald-50" iconColor="text-emerald-500" decorBg="bg-emerald-100" />
              <StatCard label="Courses"     value={stats.total_courses} sub="Active catalog"   icon={<BookOpen className="w-5 h-5" />}    iconBg="bg-red-50"     iconColor="text-red-400"     decorBg="bg-red-100"     />
              <StatCard label="Total Users" value={stats.total_users}   sub="All time"         icon={<Users className="w-5 h-5" />}       iconBg="bg-blue-50"    iconColor="text-blue-500"    decorBg="bg-blue-100"    />
            </div>
          )}

          {/* ── ENROLLMENTS ── */}
          {view === 'enrollments' && (
            <EnrollmentTab onStatsRefresh={fetchStats} />
          )}

          {/* ── COURSES ── */}
          {view === 'courses' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-sm">All Courses</h2>
                <p className="text-xs text-gray-400">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
              </div>
              {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {['#', 'Course', 'Level', 'Price', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 first:px-6">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pagedCourses.map((course, idx) => (
                          <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-400">{(coursePage - 1) * PAGE_SIZE + idx + 1}</td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-gray-800">{course.title}</p>
                              <p className="text-[10px] text-gray-400">{course.hours}+ hrs · {course.duration_days} days</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-bold uppercase border border-gray-200">{course.level}</span>
                            </td>
                            <td className="px-4 py-4"><p className="text-sm font-bold text-gray-900">${course.price}</p></td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${course.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${course.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                {course.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => setEditCourse(course)}
                                  className="p-1.5 text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteCourse(course.id)}
                                  className="p-1.5 text-red-400 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination total={courses.length} page={coursePage} onPage={p => setCoursePage(p)} />
                </>
              )}
            </div>
          )}

          {/* ── CONTACTS ── */}
          {view === 'contacts' && <ContactManager />}

          {/* ── FAQS ── */}
          {view === 'faqs' && <FaqManager />}

          {/* ── MOCK TESTS ── */}
          {/* ── CHANGED: pass onPendingCount so sidebar badge stays in sync ── */}
          {view === 'mocktests' && (
            <AdminMockTestTab onPendingCount={setMockPendingCount} />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;