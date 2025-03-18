import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'email-notifications',
      name: 'メール通知',
      description: '重要なイベントに関するメール通知を受け取ります',
      enabled: true,
    },
    {
      id: 'task-reminders',
      name: 'タスクリマインダー',
      description: '期限が近いタスクのリマインダーを受け取ります',
      enabled: true,
    },
    {
      id: 'system-updates',
      name: 'システムアップデート',
      description: 'システムの更新や新機能に関する通知を受け取ります',
      enabled: false,
    },
    {
      id: 'marketing-emails',
      name: 'マーケティングメール',
      description: '新製品や特別オファーに関する情報を受け取ります',
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSave = () => {
    // ここで実際のAPIを呼び出して設定を保存する
    // デモ用にトーストを表示
    toast({
      title: "通知設定を保存しました",
      description: "通知設定が正常に更新されました。",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>通知設定</CardTitle>
        <CardDescription>
          通知の受信方法を管理します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settings.map(setting => (
            <div key={setting.id} className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor={setting.id}>{setting.name}</Label>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <Switch
                id={setting.id}
                checked={setting.enabled}
                onCheckedChange={() => handleToggle(setting.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>設定を保存</Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;