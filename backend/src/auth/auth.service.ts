import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, firstName, lastName, phone, role, teacherCode } = registerDto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Password and confirmation password do not match');
    }

    // Validate teacher code if role is teacher
    if (role === 'teacher') {
      const expectedTeacherCode = this.configService.get<string>('TEACHER_CODE');
      if (!teacherCode || teacherCode !== expectedTeacherCode) {
        throw new BadRequestException('Invalid teacher verification code. Please contact the academy for the correct code.');
      }
    }

    const supabase = this.supabaseService.getClient();

    // Check if email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      throw new BadRequestException('An account with this email already exists');
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
      },
      email_confirm: true, // Auto-confirm email for now
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new BadRequestException('An account with this email already exists');
      }
      throw new BadRequestException(`Registration failed: ${authError.message}`);
    }

    try {
      // Create profile in database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          supabase_user_id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          role,
          is_approved: role !== 'teacher', // Teachers need approval
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // If teacher, create teacher record
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
          // Don't fail registration if teacher record creation fails
        }
      }

      // Generate JWT token
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

    } catch (error) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new BadRequestException(error.message || 'Failed to create user profile');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const supabase = this.supabaseService.getClient();

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new UnauthorizedException('Invalid email or password');
        }
        if (authError.message.includes('Email not confirmed')) {
          throw new UnauthorizedException('Please confirm your email address before logging in');
        }
        throw new UnauthorizedException(authError.message);
      }

      if (!authData.user) {
        throw new UnauthorizedException('Login failed');
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('supabase_user_id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        throw new UnauthorizedException('User profile not found. Please contact support.');
      }

      // Check if user is approved (especially for teachers)
      if (!profileData.is_approved && profileData.role === 'teacher') {
        throw new UnauthorizedException('Your teacher account is pending approval. Please wait for admin verification.');
      }

      // Generate JWT token
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
        message: `Welcome back, ${(profileData as any).first_name}!`,
      };

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async getProfile(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('supabase_user_id', userId)
      .single();

    if (error) {
      throw new UnauthorizedException('Profile not found');
    }

    return profileData;
  }

  async validateUser(payload: any) {
    const profile = await this.getProfile(payload.sub);
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      profileId: payload.profileId,
      profile,
    };
  }
}