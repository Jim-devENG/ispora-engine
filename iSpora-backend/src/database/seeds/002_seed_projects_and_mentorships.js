exports.seed = async function (knex) {
  // Clear existing data
  await knex('mentorships').del();
  await knex('projects').del();

  // Projects
  const projects = [
    {
      id: '650e8400-e29b-41d4-a716-446655440001',
      title: 'AI-Powered Student Learning Platform',
      description:
        'Building an adaptive learning platform that uses machine learning to personalize education.',
      detailed_description:
        'This project aims to create a comprehensive learning platform that adapts to individual student needs using AI algorithms. The platform will track learning patterns, identify knowledge gaps, and provide personalized content recommendations.',
      creator_id: '550e8400-e29b-41d4-a716-446655440003', // Alex Johnson (student)
      status: 'active',
      type: 'academic',
      difficulty_level: 'intermediate',
      start_date: new Date('2024-01-15'),
      end_date: new Date('2024-06-15'),
      deadline: new Date('2024-05-30'),
      max_participants: 5,
      current_participants: 3,
      is_public: true,
      requires_approval: true,
      cover_image_url:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
      tags: JSON.stringify(['AI', 'Machine Learning', 'Education', 'React', 'Python']),
      skills_required: JSON.stringify([
        'Python',
        'Machine Learning',
        'React',
        'Node.js',
        'Database Design',
      ]),
      learning_objectives: JSON.stringify([
        'Learn ML model deployment',
        'Understand adaptive learning algorithms',
        'Build scalable web applications',
        'Practice agile development',
      ]),
      resources: JSON.stringify([
        { type: 'book', title: 'Machine Learning Yearning', url: 'https://example.com/ml-book' },
        { type: 'course', title: 'TensorFlow for Beginners', url: 'https://example.com/tf-course' },
      ]),
      deliverables: JSON.stringify([
        { name: 'MVP Prototype', deadline: '2024-03-15', status: 'completed' },
        { name: 'ML Model Integration', deadline: '2024-04-30', status: 'in_progress' },
        { name: 'Final Presentation', deadline: '2024-05-30', status: 'pending' },
      ]),
      estimated_hours: 200,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440002',
      title: 'Sustainable Tech Innovation Challenge',
      description:
        'Developing technology solutions for environmental sustainability and social impact.',
      detailed_description:
        'A collaborative project focused on creating innovative technology solutions that address environmental challenges. Teams will work on different aspects of sustainability including renewable energy, waste reduction, and carbon footprint tracking.',
      creator_id: '550e8400-e29b-41d4-a716-446655440005', // TechStartup Inc
      status: 'active',
      type: 'professional',
      difficulty_level: 'advanced',
      start_date: new Date('2024-02-01'),
      end_date: new Date('2024-08-01'),
      deadline: new Date('2024-07-15'),
      max_participants: 10,
      current_participants: 8,
      is_public: true,
      requires_approval: true,
      cover_image_url:
        'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=400&fit=crop',
      tags: JSON.stringify(['Sustainability', 'Innovation', 'Climate Tech', 'Social Impact']),
      skills_required: JSON.stringify([
        'Full Stack Development',
        'Data Science',
        'IoT',
        'Mobile Development',
      ]),
      learning_objectives: JSON.stringify([
        'Understand sustainability challenges',
        'Develop innovative tech solutions',
        'Learn project management',
        'Practice team collaboration',
      ]),
      budget: 5000.0,
      currency: 'USD',
      estimated_hours: 400,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440003',
      title: 'Healthcare Data Analytics Platform',
      description:
        'Building a platform to analyze healthcare data and provide insights for better patient outcomes.',
      detailed_description:
        'This project involves creating a comprehensive analytics platform for healthcare organizations to analyze patient data, identify trends, and improve treatment outcomes while ensuring strict privacy compliance.',
      creator_id: '550e8400-e29b-41d4-a716-446655440004', // Maria Garcia
      status: 'active',
      type: 'research',
      difficulty_level: 'advanced',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-01'),
      max_participants: 6,
      current_participants: 4,
      is_public: true,
      requires_approval: true,
      cover_image_url:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
      tags: JSON.stringify(['Healthcare', 'Data Science', 'Analytics', 'Privacy', 'Research']),
      skills_required: JSON.stringify([
        'Python',
        'R',
        'SQL',
        'Data Visualization',
        'Statistics',
        'HIPAA Compliance',
      ]),
      learning_objectives: JSON.stringify([
        'Master healthcare data analysis',
        'Understand privacy regulations',
        'Build scalable analytics systems',
        'Conduct research methodology',
      ]),
      estimated_hours: 500,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await knex('projects').insert(projects);

  // Mentorships
  const mentorships = [
    {
      id: '750e8400-e29b-41d4-a716-446655440001',
      mentor_id: '550e8400-e29b-41d4-a716-446655440001', // John Smith
      mentee_id: '550e8400-e29b-41d4-a716-446655440003', // Alex Johnson
      project_id: '650e8400-e29b-41d4-a716-446655440001', // AI Learning Platform
      status: 'active',
      type: 'project_based',
      start_date: new Date('2024-01-15'),
      end_date: new Date('2024-06-15'),
      goals:
        'Help Alex learn advanced software engineering practices and machine learning implementation in production environments.',
      meeting_schedule: JSON.stringify({
        frequency: 'weekly',
        duration: 60,
        day: 'Tuesday',
        time: '14:00',
      }),
      communication_preferences: JSON.stringify(['video_call', 'slack', 'email']),
      mentor_notes:
        'Alex is very motivated and picks up concepts quickly. Focus on best practices and code review.',
      mentee_notes:
        'John is incredibly helpful and provides great insights into industry practices.',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '750e8400-e29b-41d4-a716-446655440002',
      mentor_id: '550e8400-e29b-41d4-a716-446655440002', // Sarah Davis
      mentee_id: '550e8400-e29b-41d4-a716-446655440004', // Maria Garcia
      status: 'active',
      type: 'career_guidance',
      start_date: new Date('2024-02-01'),
      end_date: new Date('2024-08-01'),
      goals:
        'Guide Maria in transitioning from academia to industry, focusing on product management and data science career paths.',
      meeting_schedule: JSON.stringify({
        frequency: 'bi-weekly',
        duration: 45,
        day: 'Friday',
        time: '16:00',
      }),
      communication_preferences: JSON.stringify(['video_call', 'email']),
      mentor_notes:
        'Maria has strong technical skills but needs guidance on industry applications and career planning.',
      mentee_notes: 'Sarah provides excellent career advice and industry insights.',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '750e8400-e29b-41d4-a716-446655440003',
      mentor_id: '550e8400-e29b-41d4-a716-446655440006', // David Chen
      mentee_id: '550e8400-e29b-41d4-a716-446655440003', // Alex Johnson
      status: 'requested',
      type: 'career_guidance',
      goals: 'Learn about entrepreneurship and startup opportunities in the tech industry.',
      meeting_schedule: JSON.stringify({
        frequency: 'monthly',
        duration: 30,
      }),
      communication_preferences: JSON.stringify(['email', 'phone']),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await knex('mentorships').insert(mentorships);
};
