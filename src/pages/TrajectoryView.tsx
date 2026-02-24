import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '@/contexts/AuthContext';

// Using Recharts for visualization
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TrajectoryState {
    E: number;
    M: number;
    S: number;
    P: number;
    L: number;
    W: number;
    risk: number;
    performance_band: string;
}

interface Intervention {
    name: string;
    cost: number;
    predicted_risk_drop: number;
    rationale: string;
}

interface TrajectoryResult {
    state: TrajectoryState;
    recommendations: Intervention[];
}

export function TrajectoryView() {
    const { user } = useAuth();
    const [result, setResult] = useState<TrajectoryResult | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Hardcoded student_01 for demo view as this page is currently global
            // Ideally it should be per-student or aggregate
            const data = await invoke<TrajectoryResult>('compute_trajectory', { 
                userId: user.id, 
                studentId: 'student_01' 
            });
            setResult(data);
        } catch (e) {
            console.error("Failed to fetch trajectory", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    if (loading) return <div className="p-6">Calculating trajectory...</div>;
    if (!result) return <div className="p-6">No data available</div>;

    const { state, recommendations } = result;

    const data = [
        { name: 'Engagement', value: state.E, color: '#3b82f6' },
        { name: 'Mastery', value: state.M, color: '#10b981' },
        { name: 'Stability', value: state.S, color: '#8b5cf6' },
        { name: 'Support', value: state.P, color: '#f59e0b' },
        { name: 'Load', value: state.L, color: '#ef4444' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Trajectory Engine</h1>
                    <p className="text-muted-foreground">Real-time risk analysis for Student 01 (Demo)</p>
                </div>
                <Button onClick={fetchData} variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>State Vector x(t)</CardTitle>
                        <CardDescription>Current dimensional status (0.0 - 1.0)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 1]} />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className={state.risk > 65 ? "border-red-500 bg-red-50" : ""}>
                        <CardHeader>
                            <CardTitle>Risk Index</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="text-5xl font-bold">{state.risk}%</div>
                            <div className="text-right">
                                <p className="font-semibold">Phase Warning: {state.W > 0.6 ? "High" : "Normal"}</p>
                                <p className="text-muted-foreground">Band: {state.performance_band}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Minimal Lever Optimization</CardTitle>
                            <CardDescription>Recommended actions to reduce risk</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recommendations.map((int, i) => (
                                    <div key={i} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <h4 className="font-semibold">{int.name}</h4>
                                            <p className="text-sm text-muted-foreground">{int.rationale}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="mb-1">Cost: {int.cost}</Badge>
                                            <div className="text-sm font-bold text-green-600">Risk -{int.predicted_risk_drop}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
