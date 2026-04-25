import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import AIAnalysis from '@/pages/AIAnalysis'
import AnalysisHistory from '@/pages/AnalysisHistory'
import SignUp from '@/pages/SignUp'
import NotFound from '@/pages/NotFound'

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
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/history" element={<AnalysisHistory />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
