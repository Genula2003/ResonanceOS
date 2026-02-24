import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { FinanceDashboard } from './pages/FinanceDashboard';
import { TrajectoryView } from './pages/TrajectoryView';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from '@/components/ui/toaster';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1><p>Welcome to Resonance School Engine.</p></div>} />
                        
                        <Route path="students" element={<div className="p-8">Student List Placeholder (Use search or click demo link)</div>} />
                        <Route path="students/:id" element={<StudentProfilePage />} />
                        
                        <Route path="classes/*" element={<div className="p-8">Classes Module</div>} />
                        
                        <Route path="finance" element={<FinanceDashboard />} />
                        
                        <Route path="trajectory" element={<TrajectoryView />} />
                        
                        <Route path="audit" element={<AuditLogPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
                <Toaster />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
