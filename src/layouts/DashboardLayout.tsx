import { useAuth, Role, RoleType } from '../contexts/AuthContext';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
    LayoutDashboard, 
    Users, 
    BookOpen, 
    CreditCard, 
    Settings, 
    LogOut,
    Activity,
    Shield
} from 'lucide-react';

export function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navItems: { label: string; path: string; icon: any; roles: RoleType[] }[] = [
        { 
            label: 'Dashboard', 
            path: '/dashboard', 
            icon: LayoutDashboard,
            roles: [Role.ADMIN, Role.TEACHER, Role.MANAGEMENT_FINANCE] 
        },
        { 
            label: 'Students', 
            path: '/students', 
            icon: Users,
            roles: [Role.ADMIN, Role.TEACHER]
        },
        { 
            label: 'Classes', 
            path: '/classes', 
            icon: BookOpen,
            roles: [Role.ADMIN, Role.TEACHER] 
        },
        { 
            label: 'Finance', 
            path: '/finance', 
            icon: CreditCard,
            roles: [Role.ADMIN, Role.MANAGEMENT_FINANCE] 
        },
        { 
            label: 'Trajectory', 
            path: '/trajectory', 
            icon: Activity,
            roles: [Role.ADMIN, Role.TEACHER] 
        },
        { 
            label: 'Audit Log', 
            path: '/audit', 
            icon: Shield,
            roles: [Role.ADMIN] 
        },
        { 
            label: 'Settings', 
            path: '/settings', 
            icon: Settings,
            roles: [Role.ADMIN, Role.TEACHER, Role.MANAGEMENT_FINANCE] 
        },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Resonance
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">School Engine v1</p>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-2">
                        {navItems.map((item) => {
                            if (!item.roles.includes(user.role)) return null;
                            
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link 
                                    key={item.path} 
                                    to={item.path}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                        isActive 
                                            ? "bg-primary/10 text-primary" 
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t bg-slate-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}
