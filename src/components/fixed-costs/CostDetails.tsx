
import React from 'react';
import { useFixedCosts } from '@/context/FixedCostsContext';
import { FixedCost } from '@/types/fixed-costs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const CostDetails: React.FC = () => {
  const { costs, monthlySummaries } = useFixedCosts();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy年MM月dd日', { locale: ja });
  };
  
  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return format(new Date(year, month - 1), 'yyyy年MM月', { locale: ja });
  };
  
  // Group costs by category
  const costsByCategory = costs.reduce((acc, cost) => {
    if (!acc[cost.category]) {
      acc[cost.category] = [];
    }
    acc[cost.category].push(cost);
    return acc;
  }, {} as Record<string, FixedCost[]>);

  // Get recurring and one-time costs
  const recurringCosts = costs.filter(cost => cost.isRecurring);
  const oneTimeCosts = costs.filter(cost => !cost.isRecurring);

  return (
    <Tabs defaultValue="monthly">
      <TabsList className="mb-4">
        <TabsTrigger value="monthly">月別内訳</TabsTrigger>
        <TabsTrigger value="category">カテゴリー別</TabsTrigger>
        <TabsTrigger value="recurring">定期/一回払い</TabsTrigger>
      </TabsList>
      
      <TabsContent value="monthly" className="space-y-4">
        {monthlySummaries.length === 0 ? (
          <Card>
            <CardContent className="py-4">
              <p className="text-center text-muted-foreground">
                月別データがありません
              </p>
            </CardContent>
          </Card>
        ) : (
          monthlySummaries
            .sort((a, b) => b.month.localeCompare(a.month))
            .map(summary => (
              <Card key={summary.month}>
                <CardHeader className="pb-2">
                  <CardTitle>{formatMonthDisplay(summary.month)}</CardTitle>
                  <CardDescription>
                    総額: {summary.totalAmount.toLocaleString()}円 | 
                    項目数: {summary.costs.length}件
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>名称</TableHead>
                          <TableHead>カテゴリー</TableHead>
                          <TableHead className="text-right">金額 (円)</TableHead>
                          <TableHead>ステータス</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.costs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              この月のデータがありません
                            </TableCell>
                          </TableRow>
                        ) : (
                          summary.costs.map((cost) => (
                            <TableRow key={cost.id}>
                              <TableCell className="font-medium">{cost.name}</TableCell>
                              <TableCell>{cost.category}</TableCell>
                              <TableCell className="text-right">{cost.amount.toLocaleString()}</TableCell>
                              <TableCell>
                                {cost.isRecurring ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    毎月
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    一回のみ
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </TabsContent>
      
      <TabsContent value="category" className="space-y-4">
        {Object.keys(costsByCategory).length === 0 ? (
          <Card>
            <CardContent className="py-4">
              <p className="text-center text-muted-foreground">
                カテゴリーデータがありません
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(costsByCategory).map(([category, categoryCosts]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  総額: {categoryCosts.reduce((sum, cost) => sum + cost.amount, 0).toLocaleString()}円 | 
                  項目数: {categoryCosts.length}件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名称</TableHead>
                        <TableHead className="text-right">金額 (円)</TableHead>
                        <TableHead>開始日</TableHead>
                        <TableHead>ステータス</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryCosts.map((cost) => (
                        <TableRow key={cost.id}>
                          <TableCell className="font-medium">{cost.name}</TableCell>
                          <TableCell className="text-right">{cost.amount.toLocaleString()}</TableCell>
                          <TableCell>{formatDate(cost.startDate)}</TableCell>
                          <TableCell>
                            {cost.isRecurring ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                毎月
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                一回のみ
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
      
      <TabsContent value="recurring" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>定期支払い</CardTitle>
            <CardDescription>
              毎月発生する固定費 - 総額: {recurringCosts.reduce((sum, cost) => sum + cost.amount, 0).toLocaleString()}円
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>カテゴリー</TableHead>
                    <TableHead className="text-right">金額 (円)</TableHead>
                    <TableHead>開始日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringCosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        定期支払いのデータがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    recurringCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell className="font-medium">{cost.name}</TableCell>
                        <TableCell>{cost.category}</TableCell>
                        <TableCell className="text-right">{cost.amount.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(cost.startDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>一回払い</CardTitle>
            <CardDescription>
              一回のみの支払い - 総額: {oneTimeCosts.reduce((sum, cost) => sum + cost.amount, 0).toLocaleString()}円
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>カテゴリー</TableHead>
                    <TableHead className="text-right">金額 (円)</TableHead>
                    <TableHead>支払日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oneTimeCosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        一回払いのデータがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    oneTimeCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell className="font-medium">{cost.name}</TableCell>
                        <TableCell>{cost.category}</TableCell>
                        <TableCell className="text-right">{cost.amount.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(cost.startDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
