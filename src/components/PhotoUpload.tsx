import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { invoke } from '@tauri-apps/api/core';
import { User, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
    entityId: string;
    entityType: 'student' | 'staff';
    currentPhotoPath?: string | null;
    onPhotoUpdated?: (newPath: string) => void;
    canEdit: boolean;
}

export function PhotoUpload({ entityId, entityType, currentPhotoPath, onPhotoUpdated, canEdit }: PhotoUploadProps) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoPath || null);
    // In a real app, we would use convertFileSrc from tauri API to show local files
    // const src = photoUrl ? convertFileSrc(photoUrl) : null; 
    
    // For now, placeholder logic
    const handleUpload = async () => {
        // Trigger file dialog, then call backend save_photo
        // invoke('save_photo', { ... })
        console.log("Upload clicked");
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    <User className="h-16 w-16 text-slate-400" />
                )}
            </div>
            {canEdit && (
                <Button variant="outline" size="sm" onClick={handleUpload}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Change Photo
                </Button>
            )}
        </div>
    );
}
