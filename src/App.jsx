import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Spinner from './components/ui/Spinner'

// Public pages
import Landing      from './pages/Landing'
import Login        from './pages/Login'
import Register     from './pages/Register'
import ClientAccess from './pages/ClientAccess'
import ClientProfile from './pages/ClientProfile'

// Creator pages
import CreatorDashboard from './pages/creator/Dashboard'
import ProfileEdit      from './pages/creator/ProfileEdit'
import JobDetail        from './pages/creator/JobDetail'
import OpenJobDetail    from './pages/creator/OpenJobDetail'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminCreators  from './pages/admin/Creators'
import AdminCreatorDetail from './pages/admin/CreatorDetail'
import AdminJobs      from './pages/admin/Jobs'
import AdminJobDetail from './pages/admin/JobDetail'
import AdminNewJob    from './pages/admin/NewJob'
import AdminEventRefs from './pages/admin/EventRefs'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireAdmin({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/creator" replace />
  return children
}

function LoadingScreen() {
  return (
    <div style={{ width:'100%', minHeight:'100vh', background:'#001621', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner />
    </div>
  )
}

export default function App() {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <div className="page-root">
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/acesso-cliente" element={<ClientAccess />} />
        <Route path="/perfil/:shareCode" element={<ClientProfile />} />

        {/* Creator */}
        <Route path="/creator" element={<RequireAuth><CreatorDashboard /></RequireAuth>} />
        <Route path="/creator/perfil" element={<RequireAuth><ProfileEdit /></RequireAuth>} />
        <Route path="/creator/job/:id" element={<RequireAuth><JobDetail /></RequireAuth>} />
        <Route path="/creator/job-aberto/:id" element={<RequireAuth><OpenJobDetail /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/creators" element={<RequireAdmin><AdminCreators /></RequireAdmin>} />
        <Route path="/admin/creators/:id" element={<RequireAdmin><AdminCreatorDetail /></RequireAdmin>} />
        <Route path="/admin/jobs" element={<RequireAdmin><AdminJobs /></RequireAdmin>} />
        <Route path="/admin/jobs/:id" element={<RequireAdmin><AdminJobDetail /></RequireAdmin>} />
        <Route path="/admin/jobs/novo" element={<RequireAdmin><AdminNewJob /></RequireAdmin>} />
        <Route path="/admin/referencias" element={<RequireAdmin><AdminEventRefs /></RequireAdmin>} />

        {/* Redirect after login */}
        <Route path="*" element={
          user
            ? profile?.role === 'admin'
              ? <Navigate to="/admin" replace />
              : <Navigate to="/creator" replace />
            : <Navigate to="/" replace />
        } />
      </Routes>
    </div>
  )
}
