const express = require('express');
const { supabaseService } = require('../utils/supabase-service');
const { verifyToken } = require('../utils/auth');
const { logger } = require('../utils/log');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ============ STUDENT PROGRESS ============

router.post('/student-progress', verifyToken, async (req, res) => {
  try {
    const { subject, score, notes } = req.body;
    const studentId = req.user.id;

    const progress = await supabaseService.createStudentProgress(studentId, {
      subject,
      score,
      notes,
      created_at: new Date()
    });

    res.status(201).json(progress);
  } catch (error) {
    logger.error('Create student progress error:', error);
    res.status(500).json({ error: 'Failed to create progress record' });
  }
});

router.get('/student-progress', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const progress = await supabaseService.getStudentProgress(studentId);

    res.json(progress);
  } catch (error) {
    logger.error('Get student progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ============ ASSIGNMENTS ============

router.post('/assignments', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create assignments' });
    }

    const assignmentData = {
      ...req.body,
      created_by: req.user.id,
      created_at: new Date()
    };

    const assignment = await supabaseService.createAssignment(assignmentData);
    res.status(201).json(assignment);
  } catch (error) {
    logger.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

router.get('/assignments', async (req, res) => {
  try {
    const { subject, status } = req.query;
    const assignments = await supabaseService.getAssignments({ subject, status });

    res.json(assignments);
  } catch (error) {
    logger.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.post('/assignments/:assignmentId/submit', verifyToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content, attachmentUrl } = req.body;
    const studentId = req.user.id;

    const submission = await supabaseService.submitAssignment(
      studentId,
      assignmentId,
      {
        content,
        attachment_url: attachmentUrl,
        submitted_at: new Date()
      }
    );

    res.status(201).json(submission);
  } catch (error) {
    logger.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

// ============ EXAMS ============

router.post('/exams', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create exams' });
    }

    const examData = {
      ...req.body,
      created_by: req.user.id,
      created_at: new Date()
    };

    const exam = await supabaseService.createExam(examData);
    res.status(201).json(exam);
  } catch (error) {
    logger.error('Create exam error:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

router.get('/exams', async (req, res) => {
  try {
    const { subject } = req.query;
    const exams = await supabaseService.getExams({ subject });

    res.json(exams);
  } catch (error) {
    logger.error('Get exams error:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

router.post('/exams/:examId/results', verifyToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { score, answers, timeSpent } = req.body;
    const studentId = req.user.id;

    const result = await supabaseService.recordExamResult(studentId, examId, {
      score,
      answers,
      time_spent: timeSpent,
      completed_at: new Date()
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Record exam result error:', error);
    res.status(500).json({ error: 'Failed to record exam result' });
  }
});

// ============ MESSAGING ============

router.post('/messages', verifyToken, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user.id;

    const msg = await supabaseService.sendMessage(senderId, recipientId, message);
    res.status(201).json(msg);
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/messages', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.query;

    const messages = await supabaseService.getMessages(userId, conversationId);
    res.json(messages);
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ============ NOTIFICATIONS ============

router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    const notifications = await supabaseService.getUserNotifications(
      userId,
      unreadOnly === 'true'
    );

    res.json(notifications);
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:notificationId/read', verifyToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await supabaseService.markNotificationAsRead(notificationId);
    res.json(notification);
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ============ ATTENDANCE ============

router.post('/attendance', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can record attendance' });
    }

    const { studentId, classId, status } = req.body;

    const attendance = await supabaseService.recordAttendance(
      studentId,
      classId,
      status
    );

    res.status(201).json(attendance);
  } catch (error) {
    logger.error('Record attendance error:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

router.get('/attendance/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const attendance = await supabaseService.getAttendanceReport(
      studentId,
      startDate,
      endDate
    );

    res.json(attendance);
  } catch (error) {
    logger.error('Get attendance report error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// ============ ANALYTICS ============

router.post('/analytics/track', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, metadata } = req.body;

    await supabaseService.trackUserActivity(userId, action, metadata);
    res.json({ success: true });
  } catch (error) {
    logger.error('Track activity error:', error);
    res.status(500).json({ error: 'Failed to track activity' });
  }
});

router.get('/analytics', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can view analytics' });
    }

    const { startDate, endDate, metric } = req.query;

    const analytics = await supabaseService.getAnalytics(
      startDate,
      endDate,
      metric
    );

    res.json(analytics);
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============ MEDIA UPLOAD ============

router.post('/media/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await supabaseService.uploadMedia(req.file);

    const { error } = await supabaseService.client.from('media').insert([
      {
        file_name: result.fileName,
        url: result.url,
        category: req.body.category || 'general',
        uploaded_by: req.user.id,
        created_at: new Date()
      }
    ]);

    if (error) throw error;

    res.status(201).json(result);
  } catch (error) {
    logger.error('Media upload error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// ============ BATCH OPERATIONS ============

router.post('/batch/insert', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can perform batch operations' });
    }

    const { table, records } = req.body;

    const result = await supabaseService.batchInsert(table, records);
    res.status(201).json({ inserted: result.length, records: result });
  } catch (error) {
    logger.error('Batch insert error:', error);
    res.status(500).json({ error: 'Failed to insert records' });
  }
});

// ============ SEARCH ============

router.get('/search', async (req, res) => {
  try {
    const { table, term, columns } = req.query;

    if (!table || !term) {
      return res.status(400).json({ error: 'Table and search term are required' });
    }

    const columnArray = columns ? columns.split(',') : [];
    const results = await supabaseService.search(table, term, columnArray);

    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============ HEALTH CHECK ============

router.get('/health', async (req, res) => {
  try {
    const isHealthy = await supabaseService.healthCheck();

    if (isHealthy) {
      res.json({ status: 'healthy', database: 'connected' });
    } else {
      res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
