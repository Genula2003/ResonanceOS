import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Note {
    id: string;
    text: string;
    author: string;
    date: string;
    tags: string[];
    is_pinned: boolean;
}

export function NotesTab({ studentId }: { studentId: string }) {
    const [notes, setNotes] = useState<Note[]>([]);

    useEffect(() => {
        setNotes([
            { id: '1', text: 'Showing great improvement in focus during math class.', author: 'Mrs. Smith', date: '2023-10-20', tags: ['PRAISE', 'IMPROVEMENT'], is_pinned: true },
            { id: '2', text: 'Forgot homework twice this week.', author: 'Mr. Jones', date: '2023-10-18', tags: ['MISSING_WORK'], is_pinned: false },
        ]);
    }, [studentId]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Note</Button>
            </div>
            {notes.map((note) => (
                <Card key={note.id} className={note.is_pinned ? 'border-l-4 border-l-yellow-400' : ''}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                                <span className="font-semibold text-sm">{note.author}</span>
                                <span className="text-xs text-muted-foreground">{note.date}</span>
                            </div>
                            {note.is_pinned && <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-2">{note.text}</p>
                        <div className="flex gap-1">
                            {note.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
