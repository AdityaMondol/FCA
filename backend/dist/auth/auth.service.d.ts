import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private jwtService;
    private configService;
    private supabaseService;
    constructor(jwtService: JwtService, configService: ConfigService, supabaseService: SupabaseService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            profile: any;
        };
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            profile: any;
        };
        message: string;
    }>;
    getProfile(userId: string): Promise<any>;
    validateUser(payload: any): Promise<{
        userId: any;
        email: any;
        role: any;
        profileId: any;
        profile: any;
    }>;
}
