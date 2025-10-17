export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        profile: {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            phone?: string;
            role: 'student' | 'guardian' | 'teacher' | 'admin';
            is_approved: boolean;
            created_at: string;
            updated_at: string;
        };
    };
    message?: string;
}
export interface UserProfile {
    id: string;
    supabase_user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: 'student' | 'guardian' | 'teacher' | 'admin';
    is_approved: boolean;
    created_at: string;
    updated_at: string;
}
