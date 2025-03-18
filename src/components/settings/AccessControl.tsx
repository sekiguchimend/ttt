import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { defaultItems, SidebarItem } from '@/components/layout/SidebarConfig';

interface ModulePermission {
  moduleId: string;
  moduleName: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface RolePermissions {
  role: string;
  modules: ModulePermission[];
}

const AccessControl = () => {
  const { isAdmin } = useAuth();
  
  // サイドバーアイテムからモジュールを生成
  const generateModulesFromSidebar = (items: SidebarItem[]): ModulePermission[] => {
    return items.map(item => ({
      moduleId: item.id,
      moduleName: item.name,
      permissions: {
        view: true,
        create: !item.adminOnly,
        edit: !item.adminOnly,
        delete: !item.adminOnly,
      }
    }));
  };

  const [permissions, setPermissions] = useState<RolePermissions[]>([
    {
      role: '管理者',
      modules: generateModulesFromSidebar(defaultItems).map(module => ({
        ...module,
        permissions: {
          view: true,
          create: true,
          edit: true,
          delete: true,
        }
      }))
    },
    {
      role: '従業員',
      modules: generateModulesFromSidebar(defaultItems)
    }
  ]);

  const handlePermissionChange = (
    roleIndex: number,
    moduleIndex: number,
    permission: keyof ModulePermission['permissions'],
    checked: boolean
  ) => {
    const newPermissions = [...permissions];
    newPermissions[roleIndex].modules[moduleIndex].permissions[permission] = checked;
    setPermissions(newPermissions);
  };

  const handleSave = () => {
    // ここで実際のAPIを呼び出して権限設定を保存する
    // デモ用にトーストを表示
    toast({
      title: "アクセス権限を保存しました",
      description: "アクセス権限設定が正常に更新されました。",
    });
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>アクセス権限設定</CardTitle>
          <CardDescription>
            ユーザー役割ごとのアクセス権限を管理します
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
        <CardTitle>アクセス権限設定</CardTitle>
        <CardDescription>
          ユーザー役割ごとのアクセス権限を管理します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {permissions.map((rolePermission, roleIndex) => (
            <div key={rolePermission.role} className="space-y-4">
              <h3 className="text-lg font-medium">{rolePermission.role}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>モジュール</TableHead>
                    <TableHead className="w-[100px] text-center">閲覧</TableHead>
                    <TableHead className="w-[100px] text-center">作成</TableHead>
                    <TableHead className="w-[100px] text-center">編集</TableHead>
                    <TableHead className="w-[100px] text-center">削除</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolePermission.modules.map((module, moduleIndex) => (
                    <TableRow key={module.moduleId}>
                      <TableCell>{module.moduleName}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={module.permissions.view}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(roleIndex, moduleIndex, 'view', checked as boolean)
                          }
                          disabled={rolePermission.role === '管理者'} // 管理者は常にすべての権限を持つ
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={module.permissions.create}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(roleIndex, moduleIndex, 'create', checked as boolean)
                          }
                          disabled={rolePermission.role === '管理者'} // 管理者は常にすべての権限を持つ
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={module.permissions.edit}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(roleIndex, moduleIndex, 'edit', checked as boolean)
                          }
                          disabled={rolePermission.role === '管理者'} // 管理者は常にすべての権限を持つ
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={module.permissions.delete}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(roleIndex, moduleIndex, 'delete', checked as boolean)
                          }
                          disabled={rolePermission.role === '管理者'} // 管理者は常にすべての権限を持つ
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

export default AccessControl;