import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Upload, CheckCircle, XCircle, Shield, Zap, BarChart3,
  Menu, X, ChevronDown, ChevronUp, Moon, Sun, ArrowRight
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import SEO from '../components/SEO'

const FAQ_DATA = [
  {
    q: 'What is ClaimFlow?',
    a: 'ClaimFlow is a modern employee expense claim management system that simplifies how teams submit, track, and approve expense reimbursements.',
  },
  {
    q: 'How does employee expense claim management work?',
    a: 'Employees register, submit claims with receipt uploads, and track their status. Admins review, approve, or reject claims with reasons — all in one streamlined dashboard.',
  },
  {
    q: 'Can employees upload receipt images?',
    a: 'Yes. ClaimFlow supports JPEG and PNG receipt image uploads with a drag-and-drop interface. You can preview your receipt before submitting.',
  },
  {
    q: 'Can employees upload PDF receipts?',
    a: 'Yes. PDF receipts are fully supported. Admins can open and view PDFs during the review process.',
  },
  {
    q: 'How does claim approval work?',
    a: 'Admins receive pending claims in their review queue. They inspect the receipt alongside the claim details and can approve or reject with a single click.',
  },
  {
    q: 'Can admins reject claims?',
    a: 'Yes. When rejecting a claim, admins must provide a clear rejection reason that the employee can view in their claim history.',
  },
  {
    q: 'Can employees see rejection reasons?',
    a: 'Absolutely. Rejection reasons are prominently displayed in the employee\'s claim detail view so they can understand what went wrong.',
  },
  {
    q: 'Is ClaimFlow responsive?',
    a: 'Yes. ClaimFlow works beautifully on mobile, tablet, and desktop. The sidebar collapses on mobile for a clean experience.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button
        className="faq-question"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`faq-${q.slice(0, 20)}`}
      >
        {q}
        {open ? <ChevronUp size={18} color="var(--muted)" aria-hidden="true" /> : <ChevronDown size={18} color="var(--muted)" aria-hidden="true" />}
      </button>
      {open && (
        <div className="faq-answer" id={`faq-${q.slice(0, 20)}`} role="region">
          {a}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ClaimFlow',
    description: 'Employee expense claim management system with receipt uploads and approval workflows.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <SEO
        title={null}
        description="ClaimFlow simplifies employee expense claims with secure receipt uploads, approval workflows, claim tracking, and centralized expense management."
        canonical="/"
        structuredData={[orgSchema, faqSchema]}
      />
      <div className="landing">
        {/* Nav */}
        <nav className="landing-nav" aria-label="Main navigation">
          <Link to="/" className="landing-nav-logo" aria-label="ClaimFlow home">
            <div className="sidebar-logo-icon" style={{ width: 34, height: 34 }}>
              <FileText size={18} />
            </div>
            <span className="landing-nav-brand">ClaimFlow</span>
          </Link>

          <ul className="landing-nav-links" role="list">
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How It Works' },
              { href: '#security', label: 'Security' },
              { href: '#faq', label: 'FAQ' },
            ].map(link => (
              <li key={link.href}>
                <a href={link.href} className="landing-nav-link">{link.label}</a>
              </li>
            ))}
          </ul>

          <div className="landing-nav-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="btn btn-secondary btn-sm landing-desktop-cta">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm landing-desktop-cta">Get Started</Link>
            <button
              className="hamburger-btn"
              onClick={() => setMobileNavOpen(o => !o)}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div style={{
            position: 'fixed', top: 64, left: 0, right: 0,
            background: 'var(--surface)', borderBottom: '1px solid var(--border)',
            padding: 16, zIndex: 90, display: 'flex', flexDirection: 'column', gap: 4,
            animation: 'slideDown 0.2s ease',
          }}>
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How It Works' },
              { href: '#security', label: 'Security' },
              { href: '#faq', label: 'FAQ' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}
                onClick={() => setMobileNavOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMobileNavOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileNavOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-badge">
            <Zap size={12} aria-hidden="true" />
            Receipt & Employee Claims Management
          </div>
          <h1 id="hero-heading">
            Employee Expense Claims,<br />
            <span className="gradient-text">Simplified</span>
          </h1>
          <p className="hero-desc">
            ClaimFlow brings employees and admins together in one streamlined platform.
            Submit receipts, track approvals, and manage expense reimbursements with clarity.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section" aria-labelledby="features-heading">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Features</div>
              <h2 id="features-heading">Everything Your Team Needs for Expense Management</h2>
              <p className="section-desc">
                From receipt upload to final approval — ClaimFlow handles the complete employee expense reimbursement workflow.
              </p>
            </div>
            <div className="features-grid">
              {[
                {
                  icon: <Upload size={24} />,
                  title: 'Receipt Upload',
                  desc: 'Drag & drop JPG, PNG, or PDF receipts. Preview images instantly before submitting.',
                },
                {
                  icon: <BarChart3 size={24} />,
                  title: 'Real-time Tracking',
                  desc: 'Employees see live claim statuses — Pending, Approved, Rejected, or Processed.',
                },
                {
                  icon: <CheckCircle size={24} />,
                  title: 'Admin Approval Workflow',
                  desc: 'Admins inspect receipts alongside claim details in a split review interface.',
                },
                {
                  icon: <XCircle size={24} />,
                  title: 'Rejection with Reason',
                  desc: 'Rejected claims include a mandatory admin reason visible to the employee.',
                },
                {
                  icon: <Shield size={24} />,
                  title: 'Secure Authentication',
                  desc: 'JWT-based auth with bcrypt password hashing and role-based access control.',
                },
                {
                  icon: <Zap size={24} />,
                  title: 'Fast & Responsive',
                  desc: 'Works beautifully on mobile, tablet, and desktop. Dark and light modes included.',
                },
              ].map(f => (
                <article key={f.title} className="feature-card">
                  <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="section" style={{ background: 'var(--surface)' }} aria-labelledby="how-heading">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">How It Works</div>
              <h2 id="how-heading">How ClaimFlow Works</h2>
              <p className="section-desc">A simple, end-to-end expense claim workflow built for modern teams.</p>
            </div>
            <div className="how-it-works-wrapper">
              <div>
                <h3 style={{ marginBottom: 20, color: 'var(--primary)' }}>For Employees</h3>
                <div className="how-it-works">
                  {[
                    { n: '1', title: 'Register & Login', desc: 'Create your account with your work email and department.' },
                    { n: '2', title: 'Submit a Claim', desc: 'Fill in merchant, amount, category, date, and upload your receipt.' },
                    { n: '3', title: 'Track Status', desc: 'Monitor your claims in real-time from Pending to Approved.' },
                    { n: '4', title: 'Get Reimbursed', desc: 'Approved claims are processed and you receive your reimbursement.' },
                  ].map(s => (
                    <div key={s.n} className="step-card">
                      <div className="step-number">{s.n}</div>
                      <h3 style={{ fontSize: '0.95rem' }}>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ marginBottom: 20, color: 'var(--secondary)' }}>For Admins</h3>
                <div className="how-it-works">
                  {[
                    { n: '1', title: 'View Dashboard', desc: 'See all pending claims, stats, and spend analytics at a glance.' },
                    { n: '2', title: 'Review Claims', desc: 'Open the split view to inspect the receipt alongside claim details.' },
                    { n: '3', title: 'Approve or Reject', desc: 'Approve valid claims or reject with a mandatory reason.' },
                    { n: '4', title: 'Mark Processed', desc: 'Mark approved claims as processed once reimbursement is completed.' },
                  ].map(s => (
                    <div key={s.n} className="step-card">
                      <div className="step-number" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--accent))' }}>{s.n}</div>
                      <h3 style={{ fontSize: '0.95rem' }}>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="section" aria-labelledby="security-heading">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Security</div>
              <h2 id="security-heading">Secure Expense Claim Management</h2>
              <p className="section-desc">Built with production-grade security practices to protect your team's data.</p>
            </div>
            <div className="features-grid">
              {[
                { icon: <Shield size={22} />, title: 'Bcrypt Password Hashing', desc: 'Passwords are securely hashed with bcrypt — never stored in plain text.' },
                { icon: <Zap size={22} />, title: 'JWT Authentication', desc: 'Secure JSON Web Tokens protect every private API route.' },
                { icon: <CheckCircle size={22} />, title: 'Role-Based Access', desc: 'Employees cannot access admin endpoints. Admins cannot see other users\' claims via employee routes.' },
                { icon: <Upload size={22} />, title: 'Validated File Uploads', desc: 'File type, MIME type, and size are all validated server-side before storage.' },
              ].map(f => (
                <article key={f.title} className="feature-card" style={{ borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section" style={{ background: 'var(--surface)' }} aria-labelledby="faq-heading">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">FAQ</div>
              <h2 id="faq-heading">Frequently Asked Questions</h2>
              <p className="section-desc">Everything you need to know about ClaimFlow expense management.</p>
            </div>
            <div className="faq-list">
              {FAQ_DATA.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 80 }}>
          <div className="container">
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: 'var(--radius-xl)',
              padding: '60px 40px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1), transparent 60%)',
              }} aria-hidden="true" />
              <h2 style={{ color: '#fff', marginBottom: 12, position: 'relative' }}>
                Ready to simplify expense management?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, fontSize: '1.05rem', position: 'relative' }}>
                Join teams already using ClaimFlow for seamless expense reimbursement tracking.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
                  Get Started Free <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/login" className="btn btn-lg btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer" aria-label="Site footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-brand">
                <Link to="/" className="landing-nav-logo" style={{ marginBottom: 0 }} aria-label="ClaimFlow home">
                  <div className="sidebar-logo-icon" style={{ width: 32, height: 32 }}><FileText size={16} /></div>
                  <span className="landing-nav-brand">ClaimFlow</span>
                </Link>
                <p>Streamlined receipt management and employee expense claim workflows for modern teams.</p>
              </div>
              <div className="footer-col">
                <h4>Product</h4>
                <ul className="footer-links">
                  <li><a href="#features">Explore ClaimFlow features</a></li>
                  <li><a href="#how-it-works">How ClaimFlow works</a></li>
                  <li><a href="#security">Security overview</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Account</h4>
                <ul className="footer-links">
                  <li><Link to="/login">Sign in to ClaimFlow</Link></li>
                  <li><Link to="/register">Create your ClaimFlow account</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Support</h4>
                <ul className="footer-links">
                  <li><a href="#faq">FAQ</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© {new Date().getFullYear()} ClaimFlow. Employee Expense Claims Management.</p>
              <p>Built with FastAPI + React + MongoDB</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
