import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import AppShell from './components/AppShell.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import FriendsPage from './pages/FriendsPage.jsx'
import CreateGroupPage from './pages/CreateGroupPage.jsx'
import GroupPage from './pages/GroupPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import InvitePage from './pages/InvitePage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import FriendInvitePage from './pages/FriendInvitePage.jsx'
import BringListPage from './pages/BringListPage.jsx'
import SettlementsPage from './pages/SettlementsPage.jsx'

function Protected() {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><span className="logo-mark"><img src="/logo.png?v=20260820" alt="" /></span></div>
  return user ? <AppShell /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/invite/:code" element={<InvitePage />} />
      <Route path="/friends/invite/:code" element={<FriendInvitePage />} />
      <Route element={<Protected />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/groups/new" element={<CreateGroupPage />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route path="/settlements" element={<SettlementsPage />} />
        <Route path="/bring-list" element={<BringListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
