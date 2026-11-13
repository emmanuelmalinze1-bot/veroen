import { Router, Route, Set } from '@redwoodjs/router'

import { useAuth } from 'src/contexts/AuthContexts'
import MainLayout from 'src/layouts/MainLayout/MainLayout'
import AdminHelpPage from 'src/pages/AdminHelpPage/AdminHelpPage'
import AdminLoginPage from 'src/pages/AdminLoginPage/AdminLoginPage'
import AdminNotificationsPage from 'src/pages/AdminNotificationsPage/AdminNotificationsPage'
import AdminOverviewPage from 'src/pages/AdminOverviewPage/AdminOverviewPage'
import AdminPortalPage from 'src/pages/AdminPortalPage/AdminPortalPage'
import AdminTasksPage from 'src/pages/AdminTasksPage/AdminTasksPage'
import AdminUserDetailPage from 'src/pages/AdminUserDetailPage/AdminUserDetailPage'
import AdminUsersPage from 'src/pages/AdminUsersPage/AdminUsersPage'
import AdminWithdrawalsPage from 'src/pages/AdminWithdrawalsPage/AdminWithdrawalsPage'
import DashboardPage from 'src/pages/DashboardPage/DashboardPage'
import DepositPage from 'src/pages/DepositPage/DepositPage'
import LandingPage from 'src/pages/LandingPage/LandingPage'
import NotFoundPage from 'src/pages/NotFoundPage/NotFoundPage'
import RegisterPage from 'src/pages/RegisterPage/RegisterPage'
import TaskModulesPage from 'src/pages/TaskModulesPage/TaskModulesPage'
import UserNotificationsPage from 'src/pages/UserNotificationsPage/UserNotificationsPage'
import UserProfilePage from 'src/pages/UserProfilePage/UserProfilePage'
import VireonBrandPage from 'src/pages/VireonBrandPage/VireonBrandPage'
import WithdrawalPage from 'src/pages/WithdrawalPage/WithdrawalPage'

// ADMIN IMPORTS

const Routes = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A1A3C]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#2F80ED]" />
      </div>
    )
  }

  return (
    <Router>
      {isAuthenticated ? (
        <Set wrap={MainLayout}>
          <Route path="/" page={DashboardPage} name="home" />
          <Route path="/tasks" page={TaskModulesPage} name="tasks" />
          <Route path="/withdraw" page={WithdrawalPage} name="withdraw" />
          <Route path="/deposit" page={DepositPage} name="deposit" />
          <Route path="/profile" page={UserProfilePage} name="profile" />
          <Route path="/notifications" page={UserNotificationsPage} name="notifications" />
          <Route path="/brand" page={VireonBrandPage} name="brand" />
        </Set>
      ) : (
        <Route path="/" page={LandingPage} name="landing" />
      )}

      {/* Registration completes the profile after Google sign-in */}
      <Route path="/register" page={RegisterPage} name="register" />

      {/* ADMIN ROUTES */}
      <Route path="/admin-login" page={AdminLoginPage} name="adminLogin" />
      <Route path="/admin" page={AdminPortalPage} name="admin" />
      <Route path="/admin/overview" page={AdminOverviewPage} name="adminOverview" />
      <Route path="/admin/withdrawals" page={AdminWithdrawalsPage} name="adminWithdrawals" />
      <Route path="/admin/tasks" page={AdminTasksPage} name="adminTasks" />
      <Route path="/admin/users" page={AdminUsersPage} name="adminUsers" />
      <Route path="/admin/user/{id}" page={AdminUserDetailPage} name="adminUserDetail" />
      <Route path="/admin/help" page={AdminHelpPage} name="adminHelp" />
      <Route path="/admin/notifications" page={AdminNotificationsPage} name="adminNotifications" />

      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
