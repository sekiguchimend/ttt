import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface SalesAchievement {
  id: string;
  user_id: string;
  date: string;
  sales_amount: number;
  new_customers: number;
  existing_customers: number;
  description: string;
  created_at: string;
  user?: {
    name: string;
  };
}

interface SalesAchievementListProps {
  achievements: SalesAchievement[];
  loading: boolean;
  isAdmin: boolean;
}

export const SalesAchievementList: React.FC<SalesAchievementListProps> = ({
  achievements,
  loading,
  isAdmin
}) => {
  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">取引一覧</h2>
      <div className="grid gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500">
                  {format(new Date(achievement.date), 'yyyy年MM月dd日', { locale: ja })}
                </div>
                {isAdmin && achievement.user && (
                  <div className="text-sm text-gray-500">
                    担当者: {achievement.user.name}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  ¥{achievement.sales_amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  新規: {achievement.new_customers}件 / 既存: {achievement.existing_customers}件
                </div>
              </div>
            </div>
            {achievement.description && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {achievement.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 