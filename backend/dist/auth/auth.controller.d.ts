import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, UserProfile } from './dto/auth-response.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    getProfile(req: any): Promise<UserProfile>;
    getCurrentUser(req: any): Promise<{
        userId: any;
        email: any;
        role: any;
        profile: any;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
