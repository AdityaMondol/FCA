const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/log');
const { validate, sanitizeInput } = require('../utils/validate');
const { AppError, ERROR_CODES } = require('../utils/error');
const { hashPassword, comparePassword } = require('../utils/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Register user
const registerUser = async (req, res) => {
  try {
    const { email, password, name, role = 'student', phone } = req.body;
    
    // Validate input
    const validation = validate('registration', req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          name,
          role,
          phone: phone || null,
          is_active: true
        }
      ])
      .select()
      .single();

    if (insertError) {
      logger.error('Error creating user', { error: insertError.message });
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    logger.info('User registered successfully', { userId: newUser.id, email });
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: userWithoutPassword 
    });
  } catch (error) {
    logger.error('Error registering user', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    const validation = validate('login', req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    // Find user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info('User logged in successfully', { userId: user.id, email });
    res.json({ 
      message: 'Login successful', 
      user: userWithoutPassword 
    });
  } catch (error) {
    logger.error('Error logging in user', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user profile', { error: error.message, userId });
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    logger.error('Error getting user profile', { error: error.message, userId: req.user.id });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, description } = req.body;
    
    // Validate input
    const validation = validate('profileUpdate', req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name: name || undefined,
        phone: phone || undefined,
        description: description || undefined,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user profile', { error: error.message, userId });
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    logger.info('User profile updated successfully', { userId });
    res.json({ 
      message: 'Profile updated successfully', 
      user: userWithoutPassword 
    });
  } catch (error) {
    logger.error('Error updating user profile', { error: error.message, userId: req.user.id });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Soft delete - set is_active to false
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false, updated_at: new Date() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error deleting user', { error: error.message, userId });
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User deleted successfully', { userId });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user', { error: error.message, userId: req.user.id });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is teacher/admin
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access forbidden' });
    }
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, phone, is_active, created_at, updated_at');

    if (error) {
      logger.error('Error fetching users', { error: error.message });
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({ users });
  } catch (error) {
    logger.error('Error getting all users', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    // Check if user is teacher/admin
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access forbidden' });
    }
    
    const { userId, role } = req.body;
    
    // Validate role
    const validRoles = ['student', 'guardian', 'teacher'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user role', { error: error.message, userId });
      return res.status(500).json({ error: 'Failed to update user role' });
    }

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User role updated successfully', { userId, newRole: role });
    res.json({ message: 'User role updated successfully', user: data });
  } catch (error) {
    logger.error('Error updating user role', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    res.status(200).json({ message: 'Forgot password functionality not implemented yet' });
  } catch (error) {
    logger.error('Error in forgot password', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    res.status(200).json({ message: 'Reset password functionality not implemented yet' });
  } catch (error) {
    logger.error('Error in reset password', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  updateUserRole
};