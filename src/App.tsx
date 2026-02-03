import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Protected Wrappers
import AdminProtectedWrapper from "@/components/wrappers/AdminProtectedWrapper";
import ManagerProtectedWrapper from "@/components/wrappers/ManagerProtectedWrapper";
import WorkerProtectedWrapper from "@/components/wrappers/WorkerProtectedWrapper";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Managers from "./pages/admin/Managers";
import Workers from "./pages/admin/Workers";
import Projects from "./pages/admin/Projects";
import Analytics from "./pages/admin/Analytics";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerTasks from "./pages/manager/ManagerTasks";

// Worker Pages
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerAttendance from "./pages/worker/WorkerAttendance";
import WorkerTasks from "./pages/worker/WorkerTasks";
import SubmitReport from "./pages/worker/SubmitReport";
import ApplyLeave from "./pages/worker/ApplyLeave";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route element={<DashboardLayout allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminProtectedWrapper><AdminDashboard /></AdminProtectedWrapper>} />
              <Route path="/admin/managers" element={<AdminProtectedWrapper><Managers /></AdminProtectedWrapper>} />
              <Route path="/admin/workers" element={<AdminProtectedWrapper><Workers /></AdminProtectedWrapper>} />
              <Route path="/admin/projects" element={<AdminProtectedWrapper><Projects /></AdminProtectedWrapper>} />
              <Route path="/admin/analytics" element={<AdminProtectedWrapper><Analytics /></AdminProtectedWrapper>} />
            </Route>

            {/* Manager Routes */}
            <Route element={<DashboardLayout allowedRoles={['manager']} />}>
              <Route path="/manager" element={<ManagerProtectedWrapper><ManagerDashboard /></ManagerProtectedWrapper>} />
              <Route path="/manager/projects" element={<ManagerProtectedWrapper><Projects /></ManagerProtectedWrapper>} />
              <Route path="/manager/tasks" element={<ManagerProtectedWrapper><ManagerTasks /></ManagerProtectedWrapper>} />
              <Route path="/manager/attendance" element={<ManagerProtectedWrapper><Workers /></ManagerProtectedWrapper>} />
              <Route path="/manager/reports" element={<ManagerProtectedWrapper><ManagerDashboard /></ManagerProtectedWrapper>} />
              <Route path="/manager/leave" element={<ManagerProtectedWrapper><ManagerDashboard /></ManagerProtectedWrapper>} />
            </Route>

            {/* Worker Routes */}
            <Route element={<DashboardLayout allowedRoles={['worker']} />}>
              <Route path="/worker" element={<WorkerProtectedWrapper><WorkerDashboard /></WorkerProtectedWrapper>} />
              <Route path="/worker/attendance" element={<WorkerProtectedWrapper><WorkerAttendance /></WorkerProtectedWrapper>} />
              <Route path="/worker/tasks" element={<WorkerProtectedWrapper><WorkerTasks /></WorkerProtectedWrapper>} />
              <Route path="/worker/report" element={<WorkerProtectedWrapper><SubmitReport /></WorkerProtectedWrapper>} />
              <Route path="/worker/leave" element={<WorkerProtectedWrapper><ApplyLeave /></WorkerProtectedWrapper>} />
              <Route path="/worker/history" element={<WorkerProtectedWrapper><WorkerAttendance /></WorkerProtectedWrapper>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
