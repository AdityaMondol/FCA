"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    constructor(jwtService, configService, supabaseService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.supabaseService = supabaseService;
    }
    async register(registerDto) {
        const { email, password, confirmPassword, firstName, lastName, phone, role, teacherCode } = registerDto;
        if (password !== confirmPassword) {
            throw new common_1.BadRequestException('Password and confirmation password do not match');
        }
        if (role === 'teacher') {
            const expectedTeacherCode = this.configService.get('TEACHER_CODE');
            if (!teacherCode || teacherCode !== expectedTeacherCode) {
                throw new common_1.BadRequestException('Invalid teacher verification code. Please contact the academy for the correct code.');
            }
        }
        const supabase = this.supabaseService.getClient();
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();
        if (existingProfile) {
            throw new common_1.BadRequestException('An account with this email already exists');
        }
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                phone,
                role,
            },
            email_confirm: true,
        });
        if (authError) {
            if (authError.message.includes('already registered')) {
                throw new common_1.BadRequestException('An account with this email already exists');
            }
            throw new common_1.BadRequestException(`Registration failed: ${authError.message}`);
        }
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .insert({
                supabase_user_id: authData.user.id,
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                role,
                is_approved: role !== 'teacher',
            })
                .select()
                .single();
            if (profileError) {
                throw new Error(`Profile creation failed: ${profileError.message}`);
            }
            if (role === 'teacher') {
                const { error: teacherError } = await supabase
                    .from('teachers')
                    .insert({
                    profile_id: profileData.id,
                    verified: false,
                    bio: null,
                    subjects: [],
                });
                if (teacherError) {
                    console.error('Failed to create teacher record:', teacherError);
                }
            }
            const payload = {
                sub: authData.user.id,
                email: authData.user.email,
                role: profileData.role,
                profileId: profileData.id,
            };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    profile: profileData,
                },
                message: role === 'teacher'
                    ? 'Registration successful! Your teacher account is pending approval.'
                    : 'Registration successful! Welcome to Farid Cadet Academy.',
            };
        }
        catch (error) {
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw new common_1.BadRequestException(error.message || 'Failed to create user profile');
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const supabase = this.supabaseService.getClient();
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (authError) {
                if (authError.message.includes('Invalid login credentials')) {
                    throw new common_1.UnauthorizedException('Invalid email or password');
                }
                if (authError.message.includes('Email not confirmed')) {
                    throw new common_1.UnauthorizedException('Please confirm your email address before logging in');
                }
                throw new common_1.UnauthorizedException(authError.message);
            }
            if (!authData.user) {
                throw new common_1.UnauthorizedException('Login failed');
            }
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('supabase_user_id', authData.user.id)
                .single();
            if (profileError || !profileData) {
                throw new common_1.UnauthorizedException('User profile not found. Please contact support.');
            }
            if (!profileData.is_approved && profileData.role === 'teacher') {
                throw new common_1.UnauthorizedException('Your teacher account is pending approval. Please wait for admin verification.');
            }
            const payload = {
                sub: authData.user.id,
                email: authData.user.email,
                role: profileData.role,
                profileId: profileData.id,
            };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    profile: profileData,
                },
                message: `Welcome back, ${profileData.first_name}!`,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Login failed. Please try again.');
        }
    }
    async getProfile(userId) {
        const supabase = this.supabaseService.getClient();
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('supabase_user_id', userId)
            .single();
        if (error) {
            throw new common_1.UnauthorizedException('Profile not found');
        }
        return profileData;
    }
    async validateUser(payload) {
        const profile = await this.getProfile(payload.sub);
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            profileId: payload.profileId,
            profile,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map