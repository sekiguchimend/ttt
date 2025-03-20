import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function DashboardNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <nav className="w-64 bg-gray-100 p-4">
      <div className="space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">ダッシュボード</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-200',
                pathname === '/dashboard' ? 'bg-gray-200' : 'transparent'
              )}
            >
              概要
            </Link>
            <Link
              href="/dashboard/kpi"
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-200',
                pathname === '/dashboard/kpi' ? 'bg-gray-200' : 'transparent'
              )}
            >
              KPI管理
            </Link>
            <Link
              href="/dashboard/transactions"
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-200',
                pathname === '/dashboard/transactions' ? 'bg-gray-200' : 'transparent'
              )}
            >
              取引管理
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </div>
    </nav>
  );
} 