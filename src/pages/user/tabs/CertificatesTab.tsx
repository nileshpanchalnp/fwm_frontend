// src/pages/user/tabs/CertificatesTab.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Award, Download } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Import logo as a module so Vite resolves it to an absolute hashed URL ──
import logoSrc from '/logo1.png';   // adjust path if needed e.g. '../../../assets/logo1.png'

interface CertData {
  id: number; certificate_no: string; score: number; total_marks: number;
  course_title: string; course_level: string; user_name: string;
  exam_title: string; issued_at: string;
}

// ── Convert any URL (including Vite asset URLs) → base64 ──────────
async function urlToBase64(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve('');
    // Force absolute URL
    img.src = src.startsWith('http') ? src : `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
  });
}

// ── Print HTML builder ────────────────────────────────────────────
function buildPrintHTML(cert: CertData, logoB64: string): string {
  const pct = Math.round((cert.score / cert.total_marks) * 100);
  const dateStr = new Date(cert.issued_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Certificate — ${cert.certificate_no}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 210mm; height: 297mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Full A4 white page, content centred */
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      font-family: 'DM Sans', sans-serif;
    }

    /* ── Outer card: fixed mm so it never overflows ── */
    .cert {
      width: 186mm;
      height: 158mm;
      background: linear-gradient(160deg, #eef9ff 0%, #fffef0 45%, #f0fff8 100%);
      border: 5px double #c9a84c;
      border-radius: 14px;
      padding: 9px;               /* space between double-border and inner border */
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Inner border ── */
    .cert-inner {
      width: 100%;
      height: 100%;
      border: 1.5px solid rgba(201,168,76,0.4);
      border-radius: 9px;
      padding: 30px 44px 26px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    /* ─── LOGO ─── */
    .logo-wrap {
      width: 84px; height: 84px;
      margin: 0 auto 10px;
      flex-shrink: 0;
    }
    .logo-wrap img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .logo-placeholder {
      width: 84px; height: 84px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a84c, #f59e0b);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 9px; font-weight: 700; letter-spacing: 1px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ─── HEADING ─── */
    .cert-title {
      font-family: 'Playfair Display', serif;
      font-size: 26px; font-weight: 700; color: #1e293b;
      margin-bottom: 3px; line-height: 1.2;
      flex-shrink: 0;
    }
    .cert-sub {
      font-size: 8.5px; color: #64748b;
      letter-spacing: 5px; text-transform: uppercase;
      flex-shrink: 0;
    }

    /* ─── GOLD DIVIDER ─── */
    .divider {
      width: 56mm; height: 1.5px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      margin: 14px auto 16px;
      flex-shrink: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ─── BODY — takes remaining height evenly ─── */
    .cert-body {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;   /* vertically centre the body block */
      gap: 0;
    }

    .label-muted  { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
    .label-dark   { font-size: 11px; color: #475569; margin-bottom: 8px; }

    .user-name {
      font-family: 'Playfair Display', serif;
      font-size: 34px; color: #0ea5e9; font-weight: 700;
      line-height: 1.15; margin-bottom: 5px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .name-rule {
      width: 88mm; height: 1.5px;
      background: linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent);
      margin: 0 auto 18px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .course-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px; color: #1e293b; font-weight: 700;
      line-height: 1.3; margin-bottom: 4px;
    }
    .exam-title {
      font-size: 10px; color: #64748b;
      font-style: italic; margin-bottom: 18px;
    }

    .score-badge {
      display: inline-block;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: #fff;
      padding: 9px 30px;
      border-radius: 50px;
      font-size: 13px; font-weight: 700;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ─── FOOTER ─── */
    .cert-footer {
      flex-shrink: 0;
      width: 100%;
      border-top: 1px solid rgba(226,232,240,0.9);
      padding-top: 14px;
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .f-label {
      font-size: 7.5px; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 4px;
    }
    .f-value       { font-size: 11px; color: #1e293b; font-weight: 700; font-family: 'Courier New', monospace; }
    .f-value.plain { font-family: 'DM Sans', sans-serif; }

    .seal {
      width: 54px; height: 54px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a84c, #f59e0b);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 7px; font-weight: 700;
      text-align: center; line-height: 1.5; letter-spacing: 0.5px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert-inner">

      <!-- LOGO -->
      <div class="logo-wrap">
        ${logoB64
          ? `<img src="${logoB64}" alt="Logo"/>`
          : `<div class="logo-placeholder">TLH</div>`
        }
      </div>

      <!-- HEADING -->
      <div class="cert-title">Certificate of Achievement</div>
      <div class="cert-sub">The Language Hunter</div>

      <!-- DIVIDER -->
      <div class="divider"></div>

      <!-- BODY -->
      <div class="cert-body">
        <div class="label-muted">This certifies that</div>
        <div class="user-name">${cert.user_name}</div>
        <div class="name-rule"></div>
        <div class="label-dark">has successfully completed</div>
        <div class="course-title">${cert.course_title}</div>
        <div class="exam-title">${cert.exam_title}</div>
        <div class="score-badge">Score: ${cert.score}&nbsp;/&nbsp;${cert.total_marks}&nbsp;&nbsp;(${pct}%)</div>
      </div>

      <!-- FOOTER -->
      <div class="cert-footer">
        <div style="text-align:left">
          <div class="f-label">Certificate No.</div>
          <div class="f-value">${cert.certificate_no}</div>
        </div>
        <div class="seal">OFFICIAL<br/>SEAL</div>
        <div style="text-align:right">
          <div class="f-label">Date Issued</div>
          <div class="f-value plain">${dateStr}</div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
}

// ── Certificate Card (dashboard preview) ─────────────────────────
const Certificate: React.FC<{ cert: CertData }> = ({ cert }) => {
  const pct = Math.round((cert.score / cert.total_marks) * 100);

  const handleDownload = async () => {
    // Use canvas trick to convert the already-loaded logo img to base64
    const logoB64 = await urlToBase64(logoSrc);
    const html = buildPrintHTML(cert, logoB64);

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups for this site.'); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    // Give Google Fonts ~1.5 s to load before printing
    setTimeout(() => win.print(), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Dashboard preview — mirrors print layout exactly ── */}
      <div style={{
        background: 'linear-gradient(160deg,#eef9ff 0%,#fffef0 45%,#f0fff8 100%)',
        border: '6px double #c9a84c',
        padding: '20px',
        margin: '16px',
        borderRadius: '16px',
        fontFamily: "'DM Sans',sans-serif",
        textAlign: 'center',
      }}>
        <div style={{ border: '1px solid rgba(201,168,76,0.3)', padding: '20px 24px', borderRadius: '10px' }}>

          {/* Logo */}
          <div style={{ width: 80, height: 80, margin: '0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src={logoSrc} alt="Logo" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
          </div>

          {/* Title */}
          <div style={{ fontFamily:'Georgia,serif', fontSize:20, fontWeight:700, color:'#1e293b', marginBottom:2 }}>
            Certificate of Achievement
          </div>
          <div style={{ fontSize:8, color:'#64748b', letterSpacing:4, textTransform:'uppercase', marginBottom:14 }}>
            The Language Hunter
          </div>

          {/* Gold rule */}
          <div style={{ width:'50%', height:1, background:'linear-gradient(90deg,transparent,#c9a84c,transparent)', margin:'0 auto 14px' }} />

          {/* Body */}
          <div style={{ fontSize:11, color:'#94a3b8', marginBottom:5 }}>This certifies that</div>
          <div style={{ fontFamily:'Georgia,serif', fontSize:20, color:'#0ea5e9', fontWeight:700, marginBottom:4, lineHeight:1.2 }}>
            {cert.user_name}
          </div>
          <div style={{ width:'70%', height:1, background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.3),transparent)', margin:'0 auto 10px' }} />
          <div style={{ fontSize:11, color:'#475569', marginBottom:6 }}>has successfully completed</div>
          <div style={{ fontFamily:'Georgia,serif', fontSize:15, color:'#1e293b', fontWeight:700, marginBottom:3 }}>{cert.course_title}</div>
          <div style={{ fontSize:10, color:'#64748b', fontStyle:'italic', marginBottom:12 }}>{cert.exam_title}</div>
          <div style={{ display:'inline-block', background:'linear-gradient(135deg,#0ea5e9,#6366f1)', color:'white', padding:'7px 20px', borderRadius:50, fontSize:12, fontWeight:700, marginBottom:16 }}>
            Score: {cert.score} / {cert.total_marks} ({pct}%)
          </div>

          {/* Footer */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #e2e8f0', paddingTop:12 }}>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:8, color:'#94a3b8', textTransform:'uppercase', letterSpacing:2 }}>Certificate No.</div>
              <div style={{ fontSize:10, color:'#1e293b', fontWeight:700, marginTop:2, fontFamily:'monospace' }}>{cert.certificate_no}</div>
            </div>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#c9a84c,#f59e0b)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:7, fontWeight:700, textAlign:'center', lineHeight:1.4 }}>
              OFFICIAL<br/>SEAL
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:8, color:'#94a3b8', textTransform:'uppercase', letterSpacing:2 }}>Date Issued</div>
              <div style={{ fontSize:10, color:'#1e293b', fontWeight:700, marginTop:2 }}>
                {new Date(cert.issued_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Download bar ── */}
      <div className="px-6 pb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-800">{cert.course_title}</p>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{cert.certificate_no}</p>
        </div>
        <button onClick={handleDownload}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors">
          <Download className="w-3.5 h-3.5" /> Download PDF
        </button>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────
const CertificatesTab: React.FC = () => {
  const [certs, setCerts] = useState<CertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/mock-tests/certificates`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCerts(d.certificates || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400 text-sm animate-pulse">
      Loading certificates…
    </div>
  );

  if (certs.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mb-4">
        <Award className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">No Certificates Yet</h2>
      <p className="text-gray-400 text-sm max-w-xs">
        Pass a mock exam to earn your certificate. Head to the Mock Test tab to begin.
      </p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Award className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-bold text-gray-900">My Certificates</h2>
        <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
          {certs.length}
        </span>
      </div>
      {certs.map(c => <Certificate key={c.id} cert={c} />)}
    </div>
  );
};

export default CertificatesTab;