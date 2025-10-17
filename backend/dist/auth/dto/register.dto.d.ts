export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    role: 'student' | 'guardian' | 'teacher';
    teacherCode?: string;
}
