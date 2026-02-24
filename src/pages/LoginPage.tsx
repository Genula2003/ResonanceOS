import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Resonance School</CardTitle>
                    <CardDescription>Login to your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    placeholder="Enter your email" 
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    placeholder="Enter your password" 
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="submit" className="w-full">Login</Button>
                    </CardFooter>
                </form>
                <div className="px-6 pb-4 text-xs text-muted-foreground">
                    <p>Demo Credentials:</p>
                    <ul className="list-disc pl-4 mt-1">
                        <li>admin@local / password</li>
                        <li>teacher@local / password</li>
                        <li>finance@local / password</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
}
