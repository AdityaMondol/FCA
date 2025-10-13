import { writable } from 'svelte/store';

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'bn';
  }
  return 'bn';
};

export const currentLanguage = writable(getInitialLanguage());

currentLanguage.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', value);
  }
});

export const toggleLanguage = () => {
  currentLanguage.update(lang => lang === 'en' ? 'bn' : 'en');
};

export const translations = {
  en: {
    // Navigation
    navTitle: 'Farid Cadet Academy',
    home: 'Home',
    about: 'About Us',
    facilities: 'Facilities',
    teachers: 'Teachers',
    media: 'Media Gallery',
    notices: 'Notices',
    contact: 'Contact Us',
    
    // Home Page
    heroTitle: 'Welcome to Farid Cadet Academy',
    heroSubtitle: 'Ahead in education service in Tangail',
    heroDescription: 'Expert coaching for cadet college admission with proven success rates',
    admissionOpen: 'Admissions Open!',
    enrollNow: 'Enroll Now',
    learnMore: 'Learn More',
    
    // Stats
    successRate: 'Success Rate',
    studentsAdmitted: 'Students Admitted',
    yearsExperience: 'Years of Experience',
    qualifiedTeachers: 'Qualified Teachers',
    
    // About
    aboutTitle: 'About Farid Cadet Academy',
    aboutDescription: 'Farid Cadet Academy has been a beacon of excellence in preparing students for cadet college admissions since 2022.',
    ourMission: 'Our Mission',
    missionText: 'To prepare students for competitive entrance examinations into cadet colleges in Bangladesh through quality education and dedicated mentorship.',
    ourVision: 'Our Vision',
    visionText: 'To be the leading coaching center for cadet college preparation, recognized for excellence and student success.',
    
    // Facilities
    facilitiesTitle: 'Our Facilities',
    facilitiesDescription: 'We provide world-class facilities to ensure the best learning environment',
    dayCoaching: 'Day Coaching',
    dayCoachingDesc: 'Comprehensive daytime classes with experienced teachers',
    nightCoaching: 'Night Coaching',
    nightCoachingDesc: 'Evening sessions for students with daytime commitments',
    residential: 'Residential Program',
    residentialDesc: 'Full-time residential coaching with 24/7 support',
    modernClassrooms: 'Modern Classrooms',
    modernClassroomsDesc: 'Well-equipped classrooms with modern teaching aids',
    library: 'Library',
    libraryDesc: 'Extensive collection of books and study materials',
    labFacilities: 'Lab Facilities',
    labFacilitiesDesc: 'Practical learning through hands-on experience',
    
    // Teachers
    teachersTitle: 'Our Expert Faculty',
    teachersDescription: 'Learn from the best educators with years of experience',
    
    // Subjects
    subjects: 'Subjects We Teach',
    bengali: 'Bengali (Bangla)',
    english: 'English',
    mathematics: 'Mathematics',
    generalKnowledge: 'General Knowledge',
    
    // Contact
    contactTitle: 'Get in Touch',
    contactDescription: 'Have questions? We\'re here to help!',
    address: 'Address',
    addressText: 'Walton More, Mymensingh Road, Tangail Sadar, Tangail',
    phone: 'Phone',
    email: 'Email',
    sendMessage: 'Send Message',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    yourMessage: 'Your Message',
    submit: 'Submit',
    
    // Notices
    noticesTitle: 'Latest Notices & Announcements',
    noticesDescription: 'Stay updated with our latest news and announcements',
    
    // Media
    mediaTitle: 'Media Gallery',
    mediaDescription: 'Glimpses of our academy life',
    
    // Footer
    footerTitle: 'Farid Cadet Academy',
    footerDescription: 'Preparing students for cadet college admissions with excellence and dedication.',
    quickLinks: 'Quick Links',
    contactInfo: 'Contact Information',
    copyright: '2024 Farid Cadet Academy. All rights reserved.',
    
    // Achievement
    achievement2023: '2023 Achievement',
    achievement2023Text: '18 students successfully admitted to cadet colleges',
    
    // Target
    targetStudents: 'Target Students',
    targetStudentsText: 'Students from Class 4 to Class 6',
    
    // Schedule
    classSchedule: 'Class Schedule',
    
    // Admission
    admissionStatus: 'Admission Status',
    admissionOngoing: 'Admissions are ongoing',
    
    // Call to Action
    joinUs: 'Join Us Today',
    startJourney: 'Start Your Journey to Success'
  },
  bn: {
    // Navigation
    navTitle: 'ফরিদ ক্যাডেট একাডেমি',
    home: 'হোম',
    about: 'আমাদের সম্পর্কে',
    facilities: 'সুবিধাসমূহ',
    teachers: 'শিক্ষকবৃন্দ',
    media: 'মিডিয়া গ্যালারি',
    notices: 'নোটিশ',
    contact: 'যোগাযোগ',
    
    // Home Page
    heroTitle: 'ফরিদ ক্যাডেট একাডেমিতে স্বাগতম',
    heroSubtitle: 'টাঙ্গাইলে শিক্ষা সেবায় এগিয়ে',
    heroDescription: 'প্রমাণিত সাফল্যের হার সহ ক্যাডেট কলেজ ভর্তির জন্য বিশেষজ্ঞ কোচিং',
    admissionOpen: 'ভর্তি চলছে!',
    enrollNow: 'এখনই ভর্তি হন',
    learnMore: 'আরও জানুন',
    
    // Stats
    successRate: 'সাফল্যের হার',
    studentsAdmitted: 'ভর্তিকৃত শিক্ষার্থী',
    yearsExperience: 'বছরের অভিজ্ঞতা',
    qualifiedTeachers: 'যোগ্য শিক্ষক',
    
    // About
    aboutTitle: 'ফরিদ ক্যাডেট একাডেমি সম্পর্কে',
    aboutDescription: 'ফরিদ ক্যাডেট একাডেমি ২০২২ সাল থেকে ক্যাডেট কলেজ ভর্তির জন্য শিক্ষার্থীদের প্রস্তুত করার ক্ষেত্রে উৎকর্ষতার আলোকবর্তিকা।',
    ourMission: 'আমাদের লক্ষ্য',
    missionText: 'মানসম্মত শিক্ষা এবং নিবেদিত পরামর্শদানের মাধ্যমে বাংলাদেশের ক্যাডেট কলেজগুলিতে প্রতিযোগিতামূলক প্রবেশ পরীক্ষার জন্য শিক্ষার্থীদের প্রস্তুত করা।',
    ourVision: 'আমাদের দৃষ্টিভঙ্গি',
    visionText: 'ক্যাডেট কলেজ প্রস্তুতির জন্য শীর্ষস্থানীয় কোচিং সেন্টার হওয়া, উৎকর্ষতা এবং শিক্ষার্থীদের সাফল্যের জন্য স্বীকৃত।',
    
    // Facilities
    facilitiesTitle: 'আমাদের সুবিধাসমূহ',
    facilitiesDescription: 'সর্বোত্তম শিক্ষার পরিবেশ নিশ্চিত করতে আমরা বিশ্বমানের সুবিধা প্রদান করি',
    dayCoaching: 'দিবা কোচিং',
    dayCoachingDesc: 'অভিজ্ঞ শিক্ষকদের সাথে ব্যাপক দিনের ক্লাস',
    nightCoaching: 'রাত্রি কোচিং',
    nightCoachingDesc: 'দিনের সময় ব্যস্ত শিক্ষার্থীদের জন্য সন্ধ্যার সেশন',
    residential: 'আবাসিক প্রোগ্রাম',
    residentialDesc: '২৪/৭ সহায়তা সহ পূর্ণকালীন আবাসিক কোচিং',
    modernClassrooms: 'আধুনিক শ্রেণীকক্ষ',
    modernClassroomsDesc: 'আধুনিক শিক্ষা উপকরণ সহ সুসজ্জিত শ্রেণীকক্ষ',
    library: 'লাইব্রেরি',
    libraryDesc: 'বই এবং অধ্যয়ন সামগ্রীর বিস্তৃত সংগ্রহ',
    labFacilities: 'ল্যাব সুবিধা',
    labFacilitiesDesc: 'হাতে-কলমে অভিজ্ঞতার মাধ্যমে ব্যবহারিক শিক্ষা',
    
    // Teachers
    teachersTitle: 'আমাদের বিশেষজ্ঞ শিক্ষকবৃন্দ',
    teachersDescription: 'বছরের অভিজ্ঞতা সহ সেরা শিক্ষাবিদদের কাছ থেকে শিখুন',
    
    // Subjects
    subjects: 'আমরা যে বিষয়গুলি পড়াই',
    bengali: 'বাংলা',
    english: 'ইংরেজি',
    mathematics: 'গণিত',
    generalKnowledge: 'সাধারণ জ্ঞান',
    
    // Contact
    contactTitle: 'যোগাযোগ করুন',
    contactDescription: 'প্রশ্ন আছে? আমরা সাহায্য করতে এখানে আছি!',
    address: 'ঠিকানা',
    addressText: 'ওয়ালটন মোড়, ময়মনসিংহ রোড, টাঙ্গাইল সদর, টাঙ্গাইল',
    phone: 'ফোন',
    email: 'ইমেইল',
    sendMessage: 'বার্তা পাঠান',
    yourName: 'আপনার নাম',
    yourEmail: 'আপনার ইমেইল',
    yourMessage: 'আপনার বার্তা',
    submit: 'জমা দিন',
    
    // Notices
    noticesTitle: 'সর্বশেষ নোটিশ ও ঘোষণা',
    noticesDescription: 'আমাদের সর্বশেষ খবর এবং ঘোষণা সম্পর্কে আপডেট থাকুন',
    
    // Media
    mediaTitle: 'মিডিয়া গ্যালারি',
    mediaDescription: 'আমাদের একাডেমি জীবনের ঝলক',
    
    // Footer
    footerTitle: 'ফরিদ ক্যাডেট একাডেমি',
    footerDescription: 'উৎকর্ষতা এবং নিষ্ঠার সাথে ক্যাডেট কলেজ ভর্তির জন্য শিক্ষার্থীদের প্রস্তুত করা।',
    quickLinks: 'দ্রুত লিঙ্ক',
    contactInfo: 'যোগাযোগের তথ্য',
    copyright: '২০২৪ ফরিদ ক্যাডেট একাডেমি। সর্বস্বত্ব সংরক্ষিত।',
    
    // Achievement
    achievement2023: '২০২৩ সালের অর্জন',
    achievement2023Text: '১৮ জন শিক্ষার্থী সফলভাবে ক্যাডেট কলেজে ভর্তি হয়েছে',
    
    // Target
    targetStudents: 'লক্ষ্য শিক্ষার্থী',
    targetStudentsText: 'চতুর্থ থেকে ষষ্ঠ শ্রেণীর শিক্ষার্থীরা',
    
    // Schedule
    classSchedule: 'ক্লাসের সময়সূচী',
    
    // Admission
    admissionStatus: 'ভর্তির অবস্থা',
    admissionOngoing: 'ভর্তি চলছে',
    
    // Call to Action
    joinUs: 'আজই আমাদের সাথে যোগ দিন',
    startJourney: 'সাফল্যের দিকে আপনার যাত্রা শুরু করুন'
  }
};
