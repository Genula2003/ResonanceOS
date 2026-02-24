import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { invoke } from '@tauri-apps/api/core';
import { useAuth, Role } from '@/contexts/AuthContext';

interface AuditLog {
    id: number;
    actor_user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    metadata_json: string | null;
    created_at: string;
}

export function AuditLogPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== Role.ADMIN) return;

        // In real app, call backend
        // invoke('get_audit_logs', { userId: user.id }).then(...)
        
        // Mock data
        setLogs([
            { id: 1, actor_user_id: 'admin', action: 'CREATE', entity_type: 'USER', entity_id: 'user_teacher_01', metadata_json: null, created_at: '2023-10-25 10:00:00' },
            { id: 2, actor_user_id: 'teacher_01', action: 'UPDATE', entity_type: 'STUDENT', entity_id: 'student_05', metadata_json: '{"field": "grade"}', created_at: '2023-10-25 11:30:00' },
        ]);
        setLoading(false);
    }, [user]);

    if (user?.role !== Role.ADMIN) {
        return <div className="p-8 text-red-500">Access Denied</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs">{log.created_at}</TableCell>
                                    <TableCell>{log.actor_user_id}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.action}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-xs text-muted-foreground mr-1">{log.entity_type}:</span>
                                        {log.entity_id}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-mono max-w-xs truncate">
                                        {log.metadata_json || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
