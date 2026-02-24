import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { invoke } from '@tauri-apps/api/core';
import { useAuth, Role } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Download, Upload, Database, Save, RotateCcw } from 'lucide-react';

export function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [backupPath, setBackupPath] = useState('');

    const handleBackup = async () => {
        try {
            const path = await invoke<string>('backup_db');
            setBackupPath(path);
            toast({ title: 'Backup Successful', description: `Saved to ${path}` });
        } catch (e) {
            toast({ title: 'Backup Failed', description: String(e), variant: 'destructive' });
        }
    };

    const handleImportCsv = () => {
        // Trigger file dialog logic here
        toast({ title: 'Import Started', description: 'Processing CSV file...' });
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    {user?.role === Role.ADMIN && <TabsTrigger value="data">Data Management</TabsTrigger>}
                    {user?.role === Role.ADMIN && <TabsTrigger value="system">System</TabsTrigger>}
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Settings</CardTitle>
                            <CardDescription>Manage general preferences</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Theme and language settings placeholders.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Database Backup & Restore</CardTitle>
                                <CardDescription>Manage your local database file.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Button onClick={handleBackup}>
                                        <Save className="mr-2 h-4 w-4" /> Create Backup
                                    </Button>
                                    <Button variant="outline">
                                        <RotateCcw className="mr-2 h-4 w-4" /> Restore from Backup
                                    </Button>
                                </div>
                                {backupPath && (
                                    <div className="p-3 bg-slate-100 rounded text-sm break-all">
                                        Last backup: {backupPath}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Data Import / Export</CardTitle>
                                <CardDescription>Bulk manage records via CSV.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border p-4 rounded-md space-y-3">
                                        <h3 className="font-semibold flex items-center"><Upload className="mr-2 h-4 w-4"/> Import Students</h3>
                                        <p className="text-sm text-muted-foreground">Upload a CSV file to add or update student records.</p>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" onClick={handleImportCsv}>Select File</Button>
                                            <Button variant="link" size="sm">Download Template</Button>
                                        </div>
                                    </div>
                                    <div className="border p-4 rounded-md space-y-3">
                                        <h3 className="font-semibold flex items-center"><Download className="mr-2 h-4 w-4"/> Export Data</h3>
                                        <p className="text-sm text-muted-foreground">Download current records as CSV.</p>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm">Export Students</Button>
                                            <Button variant="secondary" size="sm">Export Finance</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="system">
                    <Card>
                        <CardHeader><CardTitle>System Information</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-sm">
                                <p><strong>Version:</strong> v1.0.0</p>
                                <p><strong>Database:</strong> SQLite</p>
                                <p><strong>Storage Path:</strong> {backupPath || 'App Data Directory'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
