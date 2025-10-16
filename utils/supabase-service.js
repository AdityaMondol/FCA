const { createClient } = require('@supabase/supabase-js');
const { logger } = require('./log');

class SupabaseService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.client = createClient(supabaseUrl, supabaseKey);
    this.admin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
  }

  // ============ USER MANAGEMENT ============

  async createUser(email, password, userData) {
    try {
      const { data, error } = await this.admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userData
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get user error:', error);
      return null;
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.client
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      if (this.admin) {
        await this.admin.auth.admin.deleteUser(userId);
      }

      const { error } = await this.client
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  // ============ NOTICES MANAGEMENT ============

  async createNotice(noticeData) {
    try {
      const { data, error } = await this.client
        .from('notices')
        .insert([noticeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Create notice error:', error);
      throw error;
    }
  }

  async getNotices(page = 1, limit = 10, filters = {}) {
    try {
      let query = this.client.from('notices').select('*', { count: 'exact' });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, total: count, page, limit };
    } catch (error) {
      logger.error('Get notices error:', error);
      throw error;
    }
  }

  async updateNotice(noticeId, updates) {
    try {
      const { data, error } = await this.client
        .from('notices')
        .update(updates)
        .eq('id', noticeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Update notice error:', error);
      throw error;
    }
  }

  async deleteNotice(noticeId) {
    try {
      const { error } = await this.client
        .from('notices')
        .delete()
        .eq('id', noticeId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Delete notice error:', error);
      throw error;
    }
  }

  // ============ MEDIA MANAGEMENT ============

  async uploadMedia(file, bucket = 'media') {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = this.client.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { fileName, url: urlData.publicUrl };
    } catch (error) {
      logger.error('Upload media error:', error);
      throw error;
    }
  }

  async getMediaGallery(page = 1, limit = 10, category = null) {
    try {
      let query = this.client.from('media').select('*', { count: 'exact' });

      if (category) {
        query = query.eq('category', category);
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, total: count, page, limit };
    } catch (error) {
      logger.error('Get media error:', error);
      throw error;
    }
  }

  async deleteMedia(mediaId, fileName, bucket = 'media') {
    try {
      await this.client.storage.from(bucket).remove([fileName]);

      const { error } = await this.client
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Delete media error:', error);
      throw error;
    }
  }

  // ============ TEACHERS MANAGEMENT ============

  async getTeachers() {
    try {
      const { data, error } = await this.client
        .from('teachers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get teachers error:', error);
      throw error;
    }
  }

  async createTeacher(teacherData) {
    try {
      const { data, error } = await this.client
        .from('teachers')
        .insert([teacherData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Create teacher error:', error);
      throw error;
    }
  }

  async updateTeacher(teacherId, updates) {
    try {
      const { data, error } = await this.client
        .from('teachers')
        .update(updates)
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Update teacher error:', error);
      throw error;
    }
  }

  // ============ CONTACT SUBMISSIONS ============

  async createContactSubmission(contactData) {
    try {
      const { data, error } = await this.client
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Create contact submission error:', error);
      throw error;
    }
  }

  async getContactSubmissions(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const { data, error, count } = await this.client
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, total: count, page, limit };
    } catch (error) {
      logger.error('Get contact submissions error:', error);
      throw error;
    }
  }

  // ============ ANALYTICS ============

  async trackUserActivity(userId, action, metadata = {}) {
    try {
      const { error } = await this.client.from('user_activity').insert([
        {
          user_id: userId,
          action,
          metadata,
          timestamp: new Date()
        }
      ]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Track user activity error:', error);
      return { success: false };
    }
  }

  async getAnalytics(startDate, endDate, metric = 'all') {
    try {
      let query = this.client
        .from('user_activity')
        .select('*');

      query = query
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (metric !== 'all') {
        query = query.eq('action', metric);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get analytics error:', error);
      throw error;
    }
  }

  // ============ STUDENT PROGRESS ============

  async createStudentProgress(studentId, progressData) {
    try {
      const { data, error } = await this.client
        .from('student_progress')
        .insert([{ student_id: studentId, ...progressData }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Create student progress error:', error);
      throw error;
    }
  }

  async getStudentProgress(studentId) {
    try {
      const { data, error } = await this.client
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get student progress error:', error);
      throw error;
    }
  }

  // ============ ASSIGNMENTS ============

  async createAssignment(assignmentData) {
    try {
      const { data, error } = await this.client
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Create assignment error:', error);
      throw error;
    }
  }

  async getAssignments(filters = {}) {
    try {
      let query = this.client.from('assignments').select('*');

      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('due_date');

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get assignments error:', error);
      throw error;
    }
  }

  async submitAssignment(studentId, assignmentId, submissionData) {
    try {
      const { data, error } = await this.client
        .from('assignment_submissions')
        .insert([
          {
            student_id: studentId,
            assignment_id: assignmentId,
            ...submissionData
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Submit assignment error:', error);
      throw error;
    }
  }

  // ============ EXAM MANAGEMENT ============

  async createExam(examData) {
    try {
      const { data, error } = await this.client
        .from('exams')
        .insert([examData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Create exam error:', error);
      throw error;
    }
  }

  async getExams(filters = {}) {
    try {
      let query = this.client.from('exams').select('*');

      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }

      const { data, error } = await query.order('exam_date');

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get exams error:', error);
      throw error;
    }
  }

  async recordExamResult(studentId, examId, resultData) {
    try {
      const { data, error } = await this.client
        .from('exam_results')
        .insert([
          {
            student_id: studentId,
            exam_id: examId,
            ...resultData
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Record exam result error:', error);
      throw error;
    }
  }

  // ============ MESSAGING ============

  async sendMessage(senderId, recipientId, message) {
    try {
      const { data, error } = await this.client
        .from('messages')
        .insert([
          {
            sender_id: senderId,
            recipient_id: recipientId,
            content: message,
            read: false
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  }

  async getMessages(userId, conversationId = null) {
    try {
      let query = this.client
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data, error } = await query.order('created_at');

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get messages error:', error);
      throw error;
    }
  }

  // ============ NOTIFICATIONS ============

  async createNotification(userId, notificationData) {
    try {
      const { data, error } = await this.client
        .from('notifications')
        .insert([
          {
            user_id: userId,
            ...notificationData
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, unreadOnly = false) {
    try {
      let query = this.client
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get notifications error:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const { data, error } = await this.client
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      throw error;
    }
  }

  // ============ ATTENDANCE ============

  async recordAttendance(studentId, classId, status) {
    try {
      const { data, error } = await this.client
        .from('attendance')
        .insert([
          {
            student_id: studentId,
            class_id: classId,
            status,
            date: new Date()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Record attendance error:', error);
      throw error;
    }
  }

  async getAttendanceReport(studentId, startDate, endDate) {
    try {
      const { data, error } = await this.client
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get attendance report error:', error);
      throw error;
    }
  }

  // ============ BATCH OPERATIONS ============

  async batchInsert(table, records) {
    try {
      const { data, error } = await this.client
        .from(table)
        .insert(records)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`Batch insert to ${table} error:`, error);
      throw error;
    }
  }

  async batchUpdate(table, updates) {
    try {
      const promises = updates.map(({ id, data }) =>
        this.client.from(table).update(data).eq('id', id)
      );

      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      logger.error(`Batch update to ${table} error:`, error);
      throw error;
    }
  }

  // ============ SEARCH & FILTER ============

  async search(table, searchTerm, columns = []) {
    try {
      let query = this.client.from(table).select('*');

      if (columns.length > 0) {
        const filters = columns.map(col => `${col}.ilike.%${searchTerm}%`).join(',');
        query = query.or(filters);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Search error:', error);
      throw error;
    }
  }

  // ============ HEALTH CHECK ============

  async healthCheck() {
    try {
      const { error } = await this.client.from('users').select('count');
      return !error;
    } catch (error) {
      logger.error('Health check error:', error);
      return false;
    }
  }
}

const supabaseService = new SupabaseService();

module.exports = {
  supabaseService,
  SupabaseService
};
