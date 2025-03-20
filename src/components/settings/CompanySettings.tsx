import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

const CompanySettings = () => {
  const { isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    companyName: '株式会社ユニファイ',
    address: '東京都渋谷区神宮前5-52-2',
    phone: '03-1234-5678',
    email: 'info@unify.co.jp',
    website: 'https://unify.co.jp',
    taxId: '1234567890',
    description: 'ビジネスハブソリューションを提供する企業です。',
    logo: '/placeholder.svg',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここで実際のAPIを呼び出して会社情報を更新する
    // デモ用にトーストを表示
    toast({
      title: "会社情報を更新しました",
      description: "会社情報が正常に更新されました。",
    });
    setIsEditing(false);
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>会社情報設定</CardTitle>
          <CardDescription>
            会社の基本情報を管理します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            この設定は管理者のみがアクセスできます。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>会社情報設定</CardTitle>
        <CardDescription>
          会社の基本情報を管理します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">会社名</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">住所</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="website">ウェブサイト</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="taxId">法人番号</Label>
              <Input
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">会社概要</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>キャンセル</Button>
            <Button onClick={handleSubmit}>保存</Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>編集</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CompanySettings;