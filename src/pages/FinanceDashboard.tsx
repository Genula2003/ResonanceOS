import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '@/contexts/AuthContext';

interface Invoice {
    id: string;
    student_id: string;
    due_date: string;
    total_amount: number;
    status: 'PAID' | 'ISSUED' | 'OVERDUE' | 'PARTIAL' | 'VOID' | 'DRAFT';
}

export function FinanceDashboard() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        const fetchInvoices = async () => {
            try {
                const data = await invoke<Invoice[]>('get_invoices', { userId: user.id });
                setInvoices(data);
            } catch (e) {
                console.error("Failed to fetch invoices", e);
            } finally {
                setLoading(false);
            }
        };
        
        fetchInvoices();
    }, [user]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID': return <Badge className="bg-green-500">Paid</Badge>;
            case 'OVERDUE': return <Badge variant="destructive">Overdue</Badge>;
            case 'ISSUED': return <Badge variant="secondary">Issued</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) return <div className="p-6">Loading finance data...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Finance Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">Placeholder calc</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="invoices" className="w-full">
                <TabsList>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="plans">Fee Plans</TabsTrigger>
                </TabsList>

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Invoices</CardTitle>
                            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Invoice</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-mono">{inv.id}</TableCell>
                                            <TableCell>{inv.student_id}</TableCell>
                                            <TableCell>{inv.due_date}</TableCell>
                                            <TableCell>${inv.total_amount}</TableCell>
                                            <TableCell>{getStatusBadge(inv.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="payments">Payments Placeholder</TabsContent>
                <TabsContent value="plans">Fee Plans Placeholder</TabsContent>
            </Tabs>
        </div>
    );
}
