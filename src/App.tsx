import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import NewContract from '@/pages/NewContract'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import AIAnalysis from '@/pages/AIAnalysis'
import AnalysisHistory from '@/pages/AnalysisHistory'
import MyContracts from '@/pages/MyContracts'
import ContractView from '@/pages/ContractView'
import SignUp from '@/pages/SignUp'
import NotFound from '@/pages/NotFound'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import LegalKnowledgeList from '@/pages/admin/LegalKnowledgeList'
import LegalKnowledgeForm from '@/pages/admin/LegalKnowledgeForm'
import AuditLogsList from '@/pages/admin/AuditLogsList'
import SystemErrorLogsList from '@/pages/admin/SystemErrorLogsList'
import ExpertSupportList from '@/pages/ExpertSupportList'
import ExpertSupportForm from '@/pages/ExpertSupportForm'
import ExpertSupportView from '@/pages/ExpertSupportView'
import ExpertDashboard from '@/pages/admin/ExpertDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contratos/novo" element={<NewContract />} />
              <Route path="/contratos" element={<MyContracts />} />
              <Route path="/contratos/:id" element={<ContractView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/history" element={<AnalysisHistory />} />
              <Route path="/expert-support" element={<ExpertSupportList />} />
              <Route path="/expert-support/new" element={<ExpertSupportForm />} />
              <Route path="/expert-support/:id" element={<ExpertSupportView />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/expert-dashboard" element={<ExpertDashboard />} />
              <Route path="/admin/knowledge" element={<LegalKnowledgeList />} />
              <Route path="/admin/knowledge/new" element={<LegalKnowledgeForm />} />
              <Route path="/admin/knowledge/:id" element={<LegalKnowledgeForm />} />
              <Route path="/admin/audit-logs" element={<AuditLogsList />} />
              <Route path="/admin/logs" element={<SystemErrorLogsList />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
