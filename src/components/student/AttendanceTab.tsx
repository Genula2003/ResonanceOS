import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    note?: string;
}

export function AttendanceTab({ studentId }: { studentId: string }) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        // Mock fetch
        setRecords([
            { id: '1', date: '2023-10-25', status: 'PRESENT' },
            { id: '2', date: '2023-10-24', status: 'LATE', note: 'Bus delay' },
            { id: '3', date: '2023-10-23', status: 'ABSENT', note: 'Sick' },
        ]);
    }, [studentId]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PRESENT': return <Badge className="bg-green-500">Present</Badge>;
            case 'ABSENT': return <Badge variant="destructive">Absent</Badge>;
            case 'LATE': return <Badge className="bg-yellow-500">Late</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attendance History</CardTitle>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Record Attendance</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Note</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell>{record.date}</TableCell>
                                <TableCell>{getStatusBadge(record.status)}</TableCell>
                                <TableCell>{record.note || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
