
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { Dashboard, DashboardSection } from '@/components/layout/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart4, ListFilter, FileText } from "lucide-react";

import { FixedCostForm } from '@/components/fixed-costs/FixedCostForm';
import { FixedCostList } from '@/components/fixed-costs/FixedCostList';
import { MonthlyCostChart } from '@/components/fixed-costs/MonthlyCostChart';
import { MonthlySummary } from '@/components/fixed-costs/MonthlySummary';
import { CostDetails } from '@/components/fixed-costs/CostDetails';

const FixedCosts = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isAddingCost, setIsAddingCost] = useState(false);

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

  return (
    <Dashboard>
      <Header 
        title="固定費管理" 
        subtitle="固定費の分析と最適化"
        actions={
          !isAddingCost && (
            <Button onClick={() => setIsAddingCost(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              新規固定費
            </Button>
          )
        }
      />
      
      <div className="px-6 pb-8">
        {isAddingCost ? (
          <div className="mb-6">
            <FixedCostForm onComplete={() => setIsAddingCost(false)} />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart4 className="h-4 w-4 mr-2" />
                概要
              </TabsTrigger>
              <TabsTrigger value="list">
                <ListFilter className="h-4 w-4 mr-2" />
                固定費一覧
              </TabsTrigger>
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-2" />
                詳細分析
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <MonthlySummary />
              <MonthlyCostChart />
            </TabsContent>
            
            <TabsContent value="list">
              <FixedCostList />
            </TabsContent>
            
            <TabsContent value="details">
              <CostDetails />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Dashboard>
  );
};

export default FixedCosts;
