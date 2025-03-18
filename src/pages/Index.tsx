
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Briefcase, 
  Users, 
  Calculator, 
  BarChart3 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { 
  Dashboard, 
  DashboardContent, 
  DashboardGrid, 
  DashboardHeader, 
  DashboardSection 
} from '@/components/layout/Dashboard';
import { KpiCard } from '@/components/ui/KpiCard';
import { ModuleCard } from '@/components/ui/ModuleCard';
import { dashboardData } from '@/lib/data';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Dashboard>
      <Header 
        title="ダッシュボード" 
        subtitle="組織全体の主要指標と各モジュールの概要をご覧いただけます"
      />
      
      <div className="px-6">
        <DashboardSection>
          <DashboardHeader
            title="主要KPI"
            description="組織全体の現在のパフォーマンス指標"
          />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <DashboardGrid columns={{ sm: 1, md: 2, lg: 2, xl: 4 }}>
              {dashboardData.overview.map((kpi) => (
                <motion.div key={kpi.id} variants={itemVariants}>
                  <KpiCard
                    title={kpi.title}
                    value={kpi.value}
                    previousValue={kpi.previousValue}
                    format={kpi.format as any}
                    targetValue={kpi.targetValue}
                    description={kpi.description}
                    trend={kpi.trend as any}
                  />
                </motion.div>
              ))}
            </DashboardGrid>
          </motion.div>
        </DashboardSection>
        
        <DashboardSection>
          <DashboardHeader
            title="業務モジュール"
            description="各モジュールの概要と現在の状況"
          />
          
          <DashboardContent>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <motion.div variants={itemVariants}>
                <ModuleCard
                  title="営業"
                  description="営業活動の進捗管理と分析"
                  icon={<ShoppingBag size={24} className="text-blue-600" />}
                  to="/sales"
                  color="bg-blue-600"
                  metrics={dashboardData.modules[0].metrics}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <ModuleCard
                  title="採用"
                  description="採用活動の追跡と候補者管理"
                  icon={<Briefcase size={24} className="text-green-600" />}
                  to="/recruitment"
                  color="bg-green-600"
                  metrics={dashboardData.modules[1].metrics}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <ModuleCard
                  title="人事・給与"
                  description="従業員情報と給与管理"
                  icon={<Users size={24} className="text-purple-600" />}
                  to="/hr"
                  color="bg-purple-600"
                  metrics={dashboardData.modules[2].metrics}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <ModuleCard
                  title="固定費管理"
                  description="固定費の分析と最適化"
                  icon={<Calculator size={24} className="text-amber-600" />}
                  to="/fixed-costs"
                  color="bg-amber-600"
                  metrics={dashboardData.modules[3].metrics}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <ModuleCard
                  title="KPI管理"
                  description="ビジネス指標とパフォーマンス追跡"
                  icon={<BarChart3 size={24} className="text-indigo-600" />}
                  to="/kpi"
                  color="bg-indigo-600"
                  metrics={dashboardData.modules[4].metrics}
                />
              </motion.div>
            </motion.div>
          </DashboardContent>
        </DashboardSection>
      </div>
    </Dashboard>
  );
};

export default Index;
