const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const users = [
    // Mentors
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'john.mentor@example.com',
      password_hash: hashedPassword,
      first_name: 'John',
      last_name: 'Smith',
      username: 'johnmentor',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'San Francisco, CA',
      bio: 'Experienced software engineer with 10+ years in tech. Passionate about mentoring the next generation of developers.',
      avatar_url:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/johnsmith',
      github_url: 'https://github.com/johnsmith',
      user_type: 'mentor',
      status: 'active',
      email_verified: true,
      profile_completed: true,
      is_online: true,
      skills: JSON.stringify(['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Leadership']),
      interests: JSON.stringify(['Technology', 'Startups', 'Teaching', 'Innovation']),
      education: JSON.stringify([
        {
          degree: 'BS Computer Science',
          institution: 'Stanford University',
          year: '2012',
          description: 'Focus on Software Engineering and AI',
        },
      ]),
      experience: JSON.stringify([
        {
          title: 'Senior Software Engineer',
          company: 'Google',
          duration: '2018 - Present',
          description: 'Leading a team of 8 engineers building cloud infrastructure',
          current: true,
        },
        {
          title: 'Software Engineer',
          company: 'Microsoft',
          duration: '2015 - 2018',
          description: 'Developed Azure services and APIs',
        },
      ]),
      preferences: JSON.stringify({
        notifications: {
          email: { connections: true, mentorship: true, projects: true },
          push: { connections: true, mentorship: true, projects: true },
        },
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'sarah.davis@example.com',
      password_hash: hashedPassword,
      first_name: 'Sarah',
      last_name: 'Davis',
      username: 'sarahd',
      title: 'Product Manager',
      company: 'Meta',
      location: 'Seattle, WA',
      bio: 'Product manager with expertise in AI/ML products. Love helping students transition into tech careers.',
      avatar_url:
        'https://images.unsplash.com/photo-1494790108755-2616b2e48f0c?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/sarahdavis',
      user_type: 'mentor',
      status: 'active',
      email_verified: true,
      profile_completed: true,
      is_online: false,
      skills: JSON.stringify([
        'Product Management',
        'Data Analysis',
        'Machine Learning',
        'Strategy',
        'Leadership',
      ]),
      interests: JSON.stringify(['AI/ML', 'Product Strategy', 'User Research', 'Mentoring']),
      education: JSON.stringify([
        {
          degree: 'MBA',
          institution: 'Harvard Business School',
          year: '2016',
        },
        {
          degree: 'BS Mathematics',
          institution: 'MIT',
          year: '2014',
        },
      ]),
      created_at: new Date(),
      updated_at: new Date(),
    },
    // Students
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'alex.student@example.com',
      password_hash: hashedPassword,
      first_name: 'Alex',
      last_name: 'Johnson',
      username: 'alexj',
      title: 'Computer Science Student',
      company: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      bio: 'CS student passionate about web development and machine learning. Looking for mentorship in software engineering.',
      avatar_url:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
      user_type: 'student',
      status: 'active',
      email_verified: true,
      profile_completed: true,
      is_online: true,
      skills: JSON.stringify(['JavaScript', 'Python', 'React', 'Git', 'SQL']),
      interests: JSON.stringify(['Web Development', 'Machine Learning', 'Open Source', 'Startups']),
      education: JSON.stringify([
        {
          degree: 'BS Computer Science (Expected)',
          institution: 'UC Berkeley',
          year: '2025',
          description: 'Focus on Software Engineering and AI',
        },
      ]),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'maria.garcia@example.com',
      password_hash: hashedPassword,
      first_name: 'Maria',
      last_name: 'Garcia',
      username: 'mariag',
      title: 'Data Science Student',
      company: 'Stanford University',
      location: 'Palo Alto, CA',
      bio: 'Graduate student in Data Science. Interested in applying ML to healthcare and social impact projects.',
      avatar_url:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      user_type: 'student',
      status: 'active',
      email_verified: true,
      profile_completed: true,
      is_online: false,
      skills: JSON.stringify([
        'Python',
        'R',
        'Machine Learning',
        'Statistics',
        'Data Visualization',
      ]),
      interests: JSON.stringify(['Data Science', 'Healthcare', 'Social Impact', 'Research']),
      education: JSON.stringify([
        {
          degree: 'MS Data Science (Current)',
          institution: 'Stanford University',
          year: '2024',
          description: 'Focus on Healthcare Applications of ML',
        },
      ]),
      created_at: new Date(),
      updated_at: new Date(),
    },
    // Organizations
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      email: 'admin@techstartup.com',
      password_hash: hashedPassword,
      first_name: 'Tech',
      last_name: 'Startup Inc',
      username: 'techstartup',
      title: 'Innovation Program Manager',
      company: 'TechStartup Inc',
      location: 'Austin, TX',
      bio: 'We connect startups with talented students and provide internship opportunities in emerging technologies.',
      user_type: 'organization',
      status: 'active',
      email_verified: true,
      profile_completed: true,
      is_online: true,
      skills: JSON.stringify([
        'Program Management',
        'Talent Acquisition',
        'Innovation',
        'Startups',
      ]),
      interests: JSON.stringify(['Startups', 'Innovation', 'Talent Development', 'Technology']),
      created_at: new Date(),
      updated_at: new Date(),
    },
    // Alumni
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      email: 'david.alumni@example.com',
      password_hash: hashedPassword,
      first_name: 'David',
      last_name: 'Chen',
      username: 'davidc',
      title: 'Entrepreneur & Angel Investor',
      company: 'Chen Ventures',
      location: 'New York, NY',
      bio: 'Serial entrepreneur and UC Berkeley alumnus. Founded 3 successful startups and now invest in early-stage companies.',
      avatar_url:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/davidchen',
      website_url: 'https://chenventures.com',
      user_type: 'mentor',
      status: 'active',
      email_verified: true,
      profile_completed: true,
      is_online: false,
      skills: JSON.stringify([
        'Entrepreneurship',
        'Investment',
        'Strategy',
        'Leadership',
        'Business Development',
      ]),
      interests: JSON.stringify([
        'Startups',
        'Investment',
        'Innovation',
        'Mentoring',
        'Technology',
      ]),
      education: JSON.stringify([
        {
          degree: 'MBA',
          institution: 'UC Berkeley Haas',
          year: '2015',
        },
        {
          degree: 'BS Engineering',
          institution: 'UC Berkeley',
          year: '2013',
        },
      ]),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await knex('users').insert(users);
};
