import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/managers" element={<Managers />} />
              <Route path="/admin/workers" element={<Workers />} />
              <Route path="/admin/projects" element={<Projects />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>

            {/* Manager Routes */}
            <Route element={<DashboardLayout allowedRoles={['manager']} />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/projects" element={<Projects />} />
              <Route path="/manager/tasks" element={<ManagerTasks />} />
              <Route path="/manager/attendance" element={<Workers />} />
              <Route path="/manager/reports" element={<ManagerDashboard />} />
              <Route path="/manager/leave" element={<ManagerDashboard />} />
            </Route>

            {/* Worker Routes */}
            <Route element={<DashboardLayout allowedRoles={['worker']} />}>
              <Route path="/worker" element={<WorkerDashboard />} />
              <Route path="/worker/attendance" element={<WorkerAttendance />} />
              <Route path="/worker/tasks" element={<WorkerTasks />} />
              <Route path="/worker/report" element={<SubmitReport />} />
              <Route path="/worker/leave" element={<ApplyLeave />} />
              <Route path="/worker/history" element={<WorkerAttendance />} />
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
