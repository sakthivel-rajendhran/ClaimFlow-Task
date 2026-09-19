import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { FileText } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" description="The page you are looking for does not exist." noIndex />
      <div className="error-page fade-in">
        <div className="auth-glow" style={{ top: '30%', left: '30%' }} aria-hidden="true" />
        <div className="error-code" aria-label="Error 404">404</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Page not found</h1>
        <p style={{ color: 'var(--muted)', maxWidth: 360, textAlign: 'center' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <FileText size={16} /> Go Home
          </Link>
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            ← Go Back
          </button>
        </div>
      </div>
    </>
  )
}
