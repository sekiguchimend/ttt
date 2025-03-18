
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { KpiProvider } from "@/context/KpiContext";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { ContractorProvider } from "@/context/ContractorContext";
import { FixedCostsProvider } from "@/context/FixedCostsContext";
import { FinancialProvider } from "@/context/FinancialContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Sales from "./pages/Sales";
import Recruitment from "./pages/Recruitment";
import HR from "./pages/HR";
import Contractors from "./pages/Contractors";
import FixedCosts from "./pages/FixedCosts";
import KpiManagement from "./pages/KpiManagement";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

// Layout
import { Sidebar } from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <KpiProvider>
        <EmployeeProvider>
          <ContractorProvider>
            <FixedCostsProvider>
              <FinancialProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/" element={<AppLayout><Index /></AppLayout>} />
                    <Route path="/sales" element={<AppLayout><Sales /></AppLayout>} />
                    <Route path="/recruitment" element={<AppLayout><Recruitment /></AppLayout>} />
                    <Route path="/hr" element={<AppLayout><HR /></AppLayout>} />
                    <Route path="/contractors" element={<AppLayout><Contractors /></AppLayout>} />
                    <Route path="/fixed-costs" element={<AppLayout><FixedCosts /></AppLayout>} />
                    <Route path="/kpi" element={<AppLayout><KpiManagement /></AppLayout>} />
                    <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </FinancialProvider>
            </FixedCostsProvider>
          </ContractorProvider>
        </EmployeeProvider>
      </KpiProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
