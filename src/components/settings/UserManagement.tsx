import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { User, UserRole } from '@/context/AuthContext';
import { PencilIcon, TrashIcon, PlusIcon } from 'lucide-react';

// サンプルユーザーデータ
const sampleUsers: User[] = [
  {
    id: '1',
    name: '管理者',
    email: 'admin@example.com',
    role: 'admin',
    department: '経営',
    avatar: '/placeholder.svg'
  },
  {
    id: '2',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'employee',
    department: '営業',
    avatar: '/placeholder.svg'
  },
  {
    id: '3',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'employee',
    department: '人事',
    avatar: '/placeholder.svg'
  },
  {
    id: '4',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    role: 'employee',
    department: '開発',
    avatar: '/placeholder.svg'
  }
];

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'employee',
    department: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      department: '',
    });
  };

  const handleAddUser = () => {
    // 新しいユーザーを追加
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      avatar: '/placeholder.svg'
    };
    
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "ユーザーを追加しました",
      description: `${formData.name}さんを追加しました。`,
    });
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    // ユーザー情報を更新
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id
        ? { ...user, ...formData, avatar: user.avatar }
        : user
    );
    
    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
    
    toast({
      title: "ユーザー情報を更新しました",
      description: `${formData.name}さんの情報を更新しました。`,
    });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    // ユーザーを削除
    const filteredUsers = users.filter(user => user.id !== selectedUser.id);
    setUsers(filteredUsers);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    
    toast({
      title: "ユーザーを削除しました",
      description: `${selectedUser.name}さんを削除しました。`,
    });
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ユーザー管理</CardTitle>
          <CardDescription>
            システムユーザーの管理を行います
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>ユーザー管理</CardTitle>
          <CardDescription>
            システムユーザーの管理を行います
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              ユーザー追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規ユーザー追加</DialogTitle>
              <DialogDescription>
                新しいユーザーの情報を入力してください。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">役割</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="役割を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理者</SelectItem>
                    <SelectItem value="employee">従業員</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">部署</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>キャンセル</Button>
              <Button onClick={handleAddUser}>追加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>役割</TableHead>
              <TableHead>部署</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role === 'admin' ? '管理者' : '従業員'}</TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー情報編集</DialogTitle>
            <DialogDescription>
              ユーザー情報を編集してください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">名前</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">メールアドレス</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">役割</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange('role', value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="役割を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="employee">従業員</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">部署</Label>
              <Input
                id="edit-department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleEditUser}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー削除の確認</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}さんを削除してもよろしいですか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;