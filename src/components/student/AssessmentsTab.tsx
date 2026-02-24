import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Assessment {
    id: string;
    title: string;
    subject: string;
    date: string;
    score: number;
    max_score: number;
}

export function AssessmentsTab({ studentId }: { studentId: string }) {
    const [assessments, setAssessments] = useState<Assessment[]>([]);

    useEffect(() => {
        // Mock fetch
        setAssessments([
            { id: '1', title: 'Midterm Exam', subject: 'Math', date: '2023-10-15', score: 85, max_score: 100 },
            { id: '2', title: 'Chapter 3 Quiz', subject: 'Science', date: '2023-10-10', score: 18, max_score: 20 },
        ]);
    }, [studentId]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assessments</CardTitle>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Score</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Percentage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assessments.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell>{a.date}</TableCell>
                                <TableCell>{a.subject}</TableCell>
                                <TableCell>{a.title}</TableCell>
                                <TableCell>{a.score} / {a.max_score}</TableCell>
                                <TableCell className="font-bold">
                                    {Math.round((a.score / a.max_score) * 100)}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
