// src/pages/legal/TermsAndConditions.tsx
import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const TermsAndConditions: React.FC = () => {
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
          <h1 className="text-3xl font-extrabold text-slate-900 border-b pb-4 mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Terms & Conditions of Service
          </h1>
          <p className="text-xs text-slate-400 font-mono mb-8">LAST REVISED: MAY 20, 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-slate-600">
            <p>
              Please review these comprehensive Terms & Conditions before initiating account registration or processing custom payment orders within the "The Language Hunter" platform.
            </p>

            <ol className="list-decimal pl-5 space-y-6 text-slate-700 font-medium">
              <li>
                <span className="text-slate-950 font-bold block mb-1">Contractual Relationship Acceptance</span>
                <span className="font-normal text-slate-600 block">
                  By generating an identity payload or authorizing premium transactional commands on our portal, you agree to be bound by these corporate rules. If you do not accept these policies, do not utilize our learning management dashboard or modules.
                </span>
              </li>

              <li className="bg-red-50/50 border-l-4 border-red-500 p-3 rounded-r-xl">
                <span className="text-red-950 font-bold block mb-1">Immutable Profile Legal Names for Certifications</span>
                <span className="font-normal text-slate-700 block">
                  During account sign-up, users must explicitly provide their accurate, legally verified Full Name. This property maps natively to your official certificates. <strong>Once registered, this profile field becomes absolute and cannot be modified or updated under any circumstances.</strong>
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Account Credentials Security Accountability</span>
                <span className="font-normal text-slate-600 block">
                  Users are solely liable for safeguarding their alphanumeric username handles, verified email strings, and custom password entries. Sharing login hashes or delegating account entry to non-registered entities is an actionable violation.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Multi-Course Portfolio Purchases</span>
                <span className="font-normal text-slate-600 block">
                  A single authenticated user profile (bound to a distinct email asset) is authorized to purchase, track, and maintain multi-course active instances concurrently within their centralized student dashboard.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Manual UPI Remittance & Processing Fields</span>
                <span className="font-normal text-slate-600 block">
                  Premium course entry relies on manual financial processing models. Users must execute payments externally via Unified Payments Interface (UPI) and accurately manually input their physical transaction UPI ID string into our validation form.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Administrative Verification Status Flow</span>
                <span className="font-normal text-slate-600 block">
                  Upon submitting a UPI transaction string, access remains in a `pending` status state. Courses unlock across core tabs only after a platform administrator explicitly validates bank ledger inflows. This step is typically resolved within 24 hours.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Isolated Learning Tab Segmentations</span>
                <span className="font-normal text-slate-600 block">
                  Approved activations provision secure entry keys explicitly across four core curricular tracking interfaces: Reading, Listening, Writing, and Mock Testing components.
                </span>
              </li>

              <li className="bg-amber-50/50 border-l-4 border-amber-500 p-3 rounded-r-xl">
                <span className="text-amber-950 font-bold block mb-1">Standard 60-Day Availability Allotment</span>
                <span className="font-normal text-slate-700 block">
                  Approved entries carry a fixed standard lifecycle duration of exactly sixty (60) calendar days from the timestamp of administrative verification.
                </span>
              </li>

              <li className="bg-amber-50/50 border-l-4 border-amber-500 p-3 rounded-r-xl">
                <span className="text-amber-950 font-bold block mb-1">Early Passing & Accelerated 3-Day Grace Expiry</span>
                <span className="font-normal text-slate-700 block">
                  If a user passes the Mock Test early and generates an official certification payload, <strong>the remaining course lifecycle drops to exactly three (3) calendar days.</strong> Any remaining time from the original 60-day window is permanently discarded.
                </span>
              </li>

              <li className="bg-slate-900 text-slate-100 p-4 rounded-xl">
                <span className="text-white font-bold block mb-1">Strict Anti-Cheat Examination Protocols</span>
                <span className="text-slate-300 font-normal block">
                  Our application implements browser visibility tracking during testing. Changing browser tabs, adjusting window boundaries, or switching focus states during an evaluation triggers an instant, automated submission, locking current progress as your final score.
                </span>
              </li>

              <li className="bg-red-50/50 border-l-4 border-red-400 p-3 rounded-r-xl">
                <span className="text-red-950 font-bold block mb-1">Content Protection & Secure Sandbox Constraints</span>
                <span className="font-normal text-slate-700 block">
                  All instructional assets—including specialized streaming audio items, practice modules, and structured video interfaces—are completely confidential and private. Digital downloading, source scraping, screen-capturing, or code manipulation is strictly prohibited and protected.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Zero-Sharing & Piracy Mitigation Penalties</span>
                <span className="font-normal text-slate-600 block">
                  Distributing source files or sharing your personal dashboard with others will result in immediate, permanent account termination. We log system fingerprints and simultaneous IP connections to identify access sharing.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Absolute No-Refund & Cancellation Policy</span>
                <span className="font-normal text-slate-600 block">
                  Due to the immediate availability of digital source components, educational media resources, and instant entry provision, <strong>all transactions are completely final and non-refundable.</strong>
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Digital Certificate Generation Metrics</span>
                <span className="font-normal text-slate-600 block">
                  Certificates are issued only after achieving the minimum required passing grade on the course's mock test. Each certificate contains a unique reference ID linked directly to the student's unalterable registration records.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Expired Asset Renewal Paths</span>
                <span className="font-normal text-slate-600 block">
                  Once a course expires via either the 60-day limit or the 3-day post-certification cleanup rule, access to its lessons, tabs, and test suites is restricted. Re-activation requires processing a separate manual purchase check.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Portal System Downtime Limitations</span>
                <span className="font-normal text-slate-600 block">
                  We perform periodic backend database maintenance. While we aim for maximum uptime, temporary access disruptions do not justify claims for subscription extensions or payment rollbacks.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Enforcement Jurisdiction</span>
                <span className="font-normal text-slate-600 block">
                  These structural rules are interpreted under local regulatory laws. Any formal complaints or issues must be handled through proper channels within our official operational jurisdiction.
                </span>
              </li>

              <li>
                <span className="text-slate-950 font-bold block mb-1">Right to Modify Digital Frameworks</span>
                <span className="font-normal text-slate-600 block">
                  The platform reserves the right to adjust structural criteria, test question counts, interface setups, and tab properties to improve security and learning quality.
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

export default TermsAndConditions;