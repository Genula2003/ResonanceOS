import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Intervention {
    id: string;
    type: string;
    date: string;
    status: 'PLANNED' | 'DONE';
    notes: string;
}

export function InterventionsTab({ studentId }: { studentId: string }) {
    const [interventions, setInterventions] = useState<Intervention[]>([]);

    useEffect(() => {
        setInterventions([
            { id: '1', type: 'PARENT_CALL', date: '2023-10-26', status: 'PLANNED', notes: 'Discuss recent absences.' },
            { id: '2', type: 'TUTORING', date: '2023-10-15', status: 'DONE', notes: 'Math algebra review.' },
        ]);
    }, [studentId]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Interventions</CardTitle>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Log Intervention</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {interventions.map((int) => (
                        <div key={int.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{int.type.replace('_', ' ')}</span>
                                    <Badge variant={int.status === 'DONE' ? 'default' : 'outline'}>{int.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{int.notes}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {int.date}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
