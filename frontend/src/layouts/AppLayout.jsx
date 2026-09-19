import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, PlusCircle, Users, BarChart3,
  LogOut, User, Moon, Sun, Menu, X, ChevronDown, Bell,
  Clock, CheckCircle2, XCircle, Settings
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getInitials } from '../utils/formatters'

// ── Logo ────────────────────────────────────────────────
export function Logo({ size = 36 }) {
  return (
    <div className="sidebar-logo-icon" style={{ width: size, height: size }}>
      <FileText size={size * 0.55} />
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────
function EmployeeSidebar({ open, onClose }) {
  return (
    <SidebarShell open={open} onClose={onClose}>
      <nav className="sidebar-nav" aria-label="Employee navigation">
        <span className="sidebar-section-label">Main</span>
        <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={onClose} />
        <NavItem to="/claims/new" icon={<PlusCircle size={18} />} label="New Claim" onClick={onClose} />
        <NavItem to="/claims" icon={<FileText size={18} />} label="My Claims" onClick={onClose} />
        <span className="sidebar-section-label">Account</span>
        <NavItem to="/profile" icon={<User size={18} />} label="Profile" onClick={onClose} />
      </nav>
      <SidebarFooterUser onClose={onClose} />
    </SidebarShell>
  )
}

function AdminSidebar({ open, onClose }) {
  return (
    <SidebarShell open={open} onClose={onClose}>
      <nav className="sidebar-nav" aria-label="Admin navigation">
        <span className="sidebar-section-label">Overview</span>
        <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={onClose} end />
        <span className="sidebar-section-label">Claims</span>
        <NavItem to="/admin/claims/pending" icon={<Clock size={18} />} label="Pending Claims" onClick={onClose} />
        <NavItem to="/admin/claims" icon={<FileText size={18} />} label="All Claims" onClick={onClose} end />
        <span className="sidebar-section-label">Management</span>
        <NavItem to="/admin/employees" icon={<Users size={18} />} label="Employees" onClick={onClose} />
        <span className="sidebar-section-label">Account</span>
        <NavItem to="/profile" icon={<User size={18} />} label="Profile" onClick={onClose} />
      </nav>
      <SidebarFooterUser onClose={onClose} />
    </SidebarShell>
  )
}

function SidebarShell({ open, onClose, children }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 190, background: 'var(--overlay)' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Sidebar navigation">
        <Link to="/" className="sidebar-logo" aria-label="ClaimFlow home">
          <Logo />
          <span className="sidebar-logo-text">ClaimFlow</span>
        </Link>
        {children}
      </aside>
    </>
  )
}

function NavItem({ to, icon, label, onClick, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
      onClick={onClick}
      aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
    >
      <span className="nav-link-icon" aria-hidden="true">{icon}</span>
      {label}
    </NavLink>
  )
}

function SidebarFooterUser({ onClose }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose?.()
    navigate('/')
  }

  return (
    <div className="sidebar-footer">
      <button className="nav-link" onClick={handleLogout} style={{ width: '100%' }}>
        <span className="nav-link-icon" aria-hidden="true"><LogOut size={18} /></span>
        Logout
      </button>
    </div>
  )
}

// ── Header ────────────────────────────────────────────
function AppHeader({ title, onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="hamburger-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="profile-dropdown" ref={menuRef}>
          <button
            className="btn btn-ghost"
            style={{ gap: 8, padding: '6px 10px' }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Profile menu"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-info" style={{ display: 'none' }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
          </button>

          {menuOpen && (
            <div className="profile-menu" role="menu">
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{user?.email}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: 'var(--primary)',
                    background: 'var(--primary-light)', padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}>{user?.role}</span>
                </div>
              </div>
              <button className="profile-menu-item" role="menuitem" onClick={() => { navigate('/profile'); setMenuOpen(false) }}>
                <User size={15} /> Profile
              </button>
              <div className="profile-menu-divider" />
              <button className="profile-menu-item danger" role="menuitem" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ── App Layout ─────────────────────────────────────────
export default function AppLayout({ children, title = 'ClaimFlow' }) {
  const { isAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const SidebarComponent = isAdmin ? AdminSidebar : EmployeeSidebar

  return (
    <div className="app-layout">
      <SidebarComponent open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <AppHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
