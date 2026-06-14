// src/pages/legal/PrivacyPolicy.tsx
import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  return (
    <div className="min-h-screen bg-blue-400 flex flex-col justify-between font-sans selection:bg-blue-500 selection:text-white">
      {/* Platform Navigation Header */}
      <Navbar />

      {/* Main Content Area Container with padding to prevent overlapping fixed Navbar */}
      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-slate-900 border-b pb-4 mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono mb-8">LAST REVISED: MAY 20, 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-slate-600">
            <p>
              This operational document outlines how "The Language Hunter" processes your account credentials, payment tracking fields, and application performance data.
            </p>

            <ol className="list-decimal pl-5 space-y-6 text-slate-700 font-medium">
              <li>
                <span className="text-slate-950 font-bold block mb-1">Scope of Personal Data Collection</span>
                <span className="font-normal text-slate-600 block">
                  We collect personal information necessary to provide account access and verify course enrollments, including your secure username, active email address, and legal full name.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Cryptographic Password Protection</span>
                <span className="font-normal text-slate-600 block">
                  User passwords are encrypted before storage. Your raw login password string is never visible to administrative or technical staff.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">UPI Transaction Reference Storage</span>
                <span className="font-normal text-slate-600 block">
                  We store the manual alphanumeric UPI Transaction ID provided during enrollment checkout to cross-reference deposits and maintain payment audit trails.
                </span>
              </li>

              <li className="bg-blue-50/40 border-l-4 border-blue-500 p-3 rounded-r-xl">
                <span className="text-blue-950 font-bold block mb-1">Immutable Registration Properties Processing</span>
                <span className="font-normal text-slate-700 block">
                  Your registered Full Name is processed to ensure certificate authenticity. This value is locked to prevent unauthorized identity transfers on completed credentials.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Progress Tracking Logging Logic</span>
                <span className="font-normal text-slate-600 block">
                  Our application logs progress changes when a user marks a topic as completed across the Reading, Listening, and Writing tabs. This data is used solely to display progress metrics on your student dashboard.
                </span>
              </li>

              <li className="bg-slate-900 text-slate-100 p-4 rounded-xl">
                <span className="text-white font-bold block mb-1">Telemetry Monitoring for Academic Evaluations</span>
                <span className="text-slate-300 font-normal block">
                  Our testing environment tracks page visibility changes during active mock tests. This monitoring is limited strictly to exam sessions to ensure academic integrity.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Session Tracking Contexts</span>
                <span className="font-normal text-slate-600 block">
                  We use browser session storage keys to manage UI elements, such as preventing repetitive popups and verifying authentication states across portal sections.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Internal Data Isolation Boundaries</span>
                <span className="font-normal text-slate-600 block">
                  User data parameters are kept securely within isolated relational databases, with strict access control layers configured across our infrastructure endpoints.
                </span>
              </li>

              <li className="bg-red-50/50 border-l-4 border-red-500 p-3 rounded-r-xl">
                <span className="text-red-950 font-bold block mb-1">Strict Zero-Sharing Marketing Safeguard</span>
                <span className="font-normal text-slate-700 block">
                  <strong>We enforce a strict zero-sharing policy.</strong> Your email profiles, personal identifiers, payment details, and study history are never shared with or sold to third-party ad brokers.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Administrative Access Protocols</span>
                <span className="font-normal text-slate-600 block">
                  Access to user profiles and submitted payment reference keys is restricted to authenticated managers. Staff can access these details only when approving enrollments or verifying grading credentials.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Data Retention Lifecycles</span>
                <span className="font-normal text-slate-600 block">
                  Account profiles and exam performance records are kept for historical and credential-verification purposes. Upon an explicit account deletion request, identifiers are scrubbed within standard operational schedules.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Device Telemetry Mapping</span>
                <span className="font-normal text-slate-600 block">
                  The web server records basic technical indicators, such as browser versions, screen dimensions, and operating system families. This metadata is analyzed strictly to optimize media playback layout performance.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">External Redirection Mappings</span>
                <span className="font-normal text-slate-600 block">
                  Our dashboard may reference or link to external resources. We are not liable for the privacy policies or collection practices of external sites once you leave our domain bounds.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Corporate Communications Flow</span>
                <span className="font-normal text-slate-600 block">
                  Your email handle is used to send payment validation status updates, direct password reset tokens, and notifications about structural modifications to your enrolled tracks.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Changes to This Privacy Policy</span>
                <span className="font-normal text-slate-600 block">
                  The portal may occasionally update this policy to align with new system enhancements or security configurations. Continued use of the portal after updates indicates acceptance of the updated terms.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </main>

      {/* Platform Layout Footer */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;