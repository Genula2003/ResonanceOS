import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, Role } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Badge } from '@/components/ui/badge';
import { AttendanceTab } from '@/components/student/AttendanceTab';
import { AssessmentsTab } from '@/components/student/AssessmentsTab';
import { NotesTab } from '@/components/student/NotesTab';
import { InterventionsTab } from '@/components/student/InterventionsTab';
import { invoke } from '@tauri-apps/api/core';

interface StudentProfile {
    id: string;
    full_name: string;
    student_code: string;
    class_name: string;
    photo_path?: string;
    date_of_birth?: string;
    gender?: string;
    enrollment_date?: string;
    status?: string;
    address?: string;
    guardian_name?: string;
    guardian_contact?: string;
    emergency_contact?: string;
}

export function StudentProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || !id) return;

        const fetchStudent = async () => {
            setLoading(true);
            try {
                const data = await invoke<StudentProfile>('get_student_details', { 
                    userId: user.id, 
                    studentId: id 
                });
                setStudent(data);
            } catch (e) {
                console.error("Failed to fetch student", e);
                setError(String(e));
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id, user]);

    if (loading) return <div className="p-8">Loading profile...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!student) return <div className="p-8">Student not found</div>;

    const canSeeSensitive = user?.role === Role.ADMIN || user?.role === Role.TEACHER;
    const isFinance = user?.role === Role.MANAGEMENT_FINANCE;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start gap-6">
                <PhotoUpload 
                    entityId={student.id} 
                    entityType="student" 
                    currentPhotoPath={student.photo_path} 
                    canEdit={canSeeSensitive}
                />
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{student.full_name}</h1>
                    <div className="flex gap-2 mt-2 text-muted-foreground">
                        <Badge variant="outline">{student.student_code}</Badge>
                        <Badge variant="secondary">{student.class_name}</Badge>
                        {student.status && (
                            <Badge className={student.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}>
                                {student.status}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {!isFinance && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
                    {!isFinance && <TabsTrigger value="assessments">Assessments</TabsTrigger>}
                    {!isFinance && <TabsTrigger value="notes">Notes</TabsTrigger>}
                    {!isFinance && <TabsTrigger value="interventions">Interventions</TabsTrigger>}
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader><CardTitle>Trajectory Overview</CardTitle></CardHeader>
                        <CardContent>
                            <p>State Vector and Risk Charts will go here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="details">
                    <Card>
                        <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {student.enrollment_date && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Enrollment Date</p>
                                        <p>{student.enrollment_date}</p>
                                    </div>
                                )}
                                {canSeeSensitive && (
                                    <>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                            <p>{student.date_of_birth}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Gender</p>
                                            <p>{student.gender}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {canSeeSensitive ? (
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-semibold mb-3 text-red-600">Sensitive Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                                            <p>{student.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Guardian</p>
                                            <p>{student.guardian_name} ({student.guardian_contact})</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                                            <p>{student.emergency_contact}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t pt-4 mt-4">
                                    <p className="text-sm text-muted-foreground italic">
                                        Sensitive personal details are restricted for this role.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {!isFinance && <TabsContent value="attendance"><AttendanceTab studentId={student.id} /></TabsContent>}
                {!isFinance && <TabsContent value="assessments"><AssessmentsTab studentId={student.id} /></TabsContent>}
                {!isFinance && <TabsContent value="notes"><NotesTab studentId={student.id} /></TabsContent>}
                {!isFinance && <TabsContent value="interventions"><InterventionsTab studentId={student.id} /></TabsContent>}
            </Tabs>
        </div>
    );
}
