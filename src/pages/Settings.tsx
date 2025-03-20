import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { Dashboard, DashboardContent, DashboardHeader } from '@/components/layout/Dashboard';
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
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  department: string;
  position: string;
  phone: string;
}

const Settings = () => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [updating, setUpdating] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // まずプロフィールが存在するか確認
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingProfile) {
        // プロフィールが存在しない場合は新規作成
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user?.id,
              email: user?.email,
              full_name: '',
              department: '',
              position: '',
              phone: ''
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
      } else {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error('プロフィールの取得に失敗しました:', error);
      toast({
        title: "エラー",
        description: "プロフィールの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          department: profile.department,
          position: profile.position,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "成功",
        description: "プロフィールを更新しました。",
      });
    } catch (error) {
      console.error('プロフィールの更新に失敗しました:', error);
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Dashboard>
      <DashboardHeader
        title="設定"
        description="アカウント設定とプロフィール情報を管理します。"
      />
      <DashboardContent>
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">プロフィール設定</TabsTrigger>
            <TabsTrigger value="system" disabled={!isAdmin}>システム設定</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>プロフィール情報</CardTitle>
                  <CardDescription>
                    個人情報を更新します。変更は即座に反映されます。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">氏名</Label>
                      <Input
                        id="full_name"
                        value={profile?.full_name || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">部署</Label>
                      <Input
                        id="department"
                        value={profile?.department || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, department: e.target.value } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">役職</Label>
                      <Input
                        id="position"
                        value={profile?.position || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, position: e.target.value } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">電話番号</Label>
                      <Input
                        id="phone"
                        value={profile?.phone || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      />
                    </div>
                    <Button type="submit" disabled={updating}>
                      {updating ? '更新中...' : '更新する'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>パスワード変更</CardTitle>
                  <CardDescription>
                    アカウントのパスワードを変更します。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordChangeForm />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>通知設定</CardTitle>
                  <CardDescription>
                    システムからの通知設定を管理します。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationSettings />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-6 mt-6">
            {isAdmin && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>会社情報</CardTitle>
                    <CardDescription>
                      会社の基本情報を管理します。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CompanySettings />
                  </CardContent>
                </Card>
                <Separator className="my-6" />
                <Card>
                  <CardHeader>
                    <CardTitle>ユーザー管理</CardTitle>
                    <CardDescription>
                      システムユーザーの管理を行います。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserManagement />
                  </CardContent>
                </Card>
                <Separator className="my-6" />
                <Card>
                  <CardHeader>
                    <CardTitle>従業員評価</CardTitle>
                    <CardDescription>
                      従業員評価の設定を管理します。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmployeeEvaluation />
                  </CardContent>
                </Card>
                <Separator className="my-6" />
                <Card>
                  <CardHeader>
                    <CardTitle>採用管理</CardTitle>
                    <CardDescription>
                      採用プロセスの設定を管理します。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecruitmentSettings />
                  </CardContent>
                </Card>
                <Separator className="my-6" />
                <Card>
                  <CardHeader>
                    <CardTitle>アクセス制御</CardTitle>
                    <CardDescription>
                      システムのアクセス権限を管理します。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AccessControl />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DashboardContent>
    </Dashboard>
  );
};

export default Settings;
