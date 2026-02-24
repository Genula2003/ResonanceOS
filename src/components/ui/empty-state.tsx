import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    icon?: React.ElementType;
}

export function EmptyState({ 
    title = "No data found", 
    description = "There are no records to display.", 
    icon: Icon = FolderOpen,
    className,
    ...props 
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-slate-50 min-h-[200px]", className)} {...props}>
            <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
        </div>
    );
}
