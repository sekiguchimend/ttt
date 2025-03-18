import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/layout/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import UserSettingsForm from '@/components/settings/UserSettingsForm';
import PasswordChangeForm from '@/components/settings/PasswordChangeForm';
import NotificationSettings from '@/components/settings/NotificationSettings';
import CompanySettings from '@/components/settings/CompanySettings';
import UserManagement from '@/components/settings/UserManagement';
import AccessControl from '@/components/settings/AccessControl';
import RecruitmentSettings from '@/components/settings/RecruitmentSettings';
import EmployeeEvaluation from '@/components/settings/EmployeeEvaluation';

const Settings = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");

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
        title="設定"
        subtitle="システム設定と個人設定"
      />
      
      <div className="px-6 space-y-6">
        <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">ユーザー設定</TabsTrigger>
            <TabsTrigger value="system" disabled={!isAdmin}>システム設定</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UserSettingsForm />
              <PasswordChangeForm />
            </div>
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="system" className="space-y-6 mt-6">
            <CompanySettings />
            <Separator className="my-6" />
            <UserManagement />
            <Separator className="my-6" />
            <EmployeeEvaluation />
            <Separator className="my-6" />
            <RecruitmentSettings />
            <Separator className="my-6" />
            <AccessControl />
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
};

export default Settings;
