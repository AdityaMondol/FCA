// Formatting utilities

export const formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date, locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const dateObj = new Date(date);
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Bangladesh phone number
  if (cleaned.startsWith('88')) {
    const number = cleaned.substring(2);
    return `+88 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  } else if (cleaned.startsWith('01')) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
};