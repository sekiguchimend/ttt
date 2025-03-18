
import React from 'react';
import { format } from 'date-fns';
import { PlusCircle, Pencil, FileText } from 'lucide-react';
import { Contractor } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ContractorListProps {
  contractors: Contractor[];
  onAddContractor: () => void;
  onEditContractor: (id: string) => void;
  onViewPayments: (id: string) => void;
}

export const ContractorList: React.FC<ContractorListProps> = ({
  contractors,
  onAddContractor,
  onEditContractor,
  onViewPayments,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy/MM/dd');
  };

  const getStatusBadge = (status: Contractor['status']) => {
    switch (status) {
      case '進行中':
        return <Badge className="bg-green-500">進行中</Badge>;
      case '完了':
        return <Badge className="bg-blue-500">完了</Badge>;
      case '中断':
        return <Badge className="bg-yellow-500">中断</Badge>;
      default:
        return <Badge>不明</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>業務委託先一覧</CardTitle>
            <CardDescription>
              業務委託先の管理と支払い状況
            </CardDescription>
          </div>
          <Button onClick={onAddContractor}>
            <PlusCircle className="mr-2 h-4 w-4" />
            業務委託先を追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前/会社名</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead>契約期間</TableHead>
              <TableHead>支払いサイクル</TableHead>
              <TableHead>契約金額</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractors.length > 0 ? (
              contractors.map(contractor => (
                <TableRow key={contractor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contractor.name}</div>
                      {contractor.company && <div className="text-sm text-muted-foreground">{contractor.company}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{contractor.contactPerson || '-'}</TableCell>
                  <TableCell>
                    {formatDate(contractor.startDate)} 〜 {contractor.endDate ? formatDate(contractor.endDate) : '継続中'}
                  </TableCell>
                  <TableCell>{contractor.paymentCycle}</TableCell>
                  <TableCell>{contractor.contractAmount.toLocaleString()}円</TableCell>
                  <TableCell>{getStatusBadge(contractor.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditContractor(contractor.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewPayments(contractor.id)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  業務委託先のデータはまだありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
