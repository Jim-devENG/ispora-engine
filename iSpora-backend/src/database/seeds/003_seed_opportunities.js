exports.seed = async function(knex) {
  // Clear existing data
  await knex('opportunities').del();

  const opportunities = [
    {
      id: '850e8400-e29b-41d4-a716-446655440001',
      title: 'Google Summer of Code 2024',
      type: 'fellowship',
      company: 'Google',
      location: 'Remote',
      remote: true,
      description: 'Work on open source projects with mentorship from Google engineers.',
      full_description: 'Google Summer of Code is a global program focused on bringing more developers into open source software development. Students work with an open source organization on a 12+ week programming project during their break between university semesters.',
      requirements: JSON.stringify([
        'Currently enrolled university student',
        'Strong programming skills',
        'Passion for open source'
      ]),
      benefits: JSON.stringify([
        '$6,000 stipend',
        'Mentorship from Google engineers',
        'Certificate of completion',
        'Networking opportunities'
      ]),
      amount: JSON.stringify({
        value: 6000,
        currency: 'USD',
        type: 'stipend'
      }),
      duration: '12 weeks',
      commitment: 'Full-time',
      posted_by: '550e8400-e29b-41d4-a716-446655440005', // TechStartup Inc
      tags: JSON.stringify(['Open Source', 'Programming', 'Mentorship', 'Google']),
      applicants: 1247,
      deadline: '2024-04-15',
      featured: true,
      urgent: false,
      boost: 5,
      experience_level: 'mid',
      category: 'Technology',
      eligibility: JSON.stringify([
        'University student',
        'Age 18 or older',
        'Available for 12 weeks'
      ]),
      application_link: 'https://summerofcode.withgoogle.com',
      application_process: JSON.stringify([
        'Submit application online',
        'Choose organization and project',
        'Write project proposal',
        'Wait for selection results'
      ]),
      contact_info: JSON.stringify({
        email: 'gsoc@google.com',
        website: 'https://summerofcode.withgoogle.com'
      }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440002',
      title: 'Software Engineering Internship',
      type: 'internship',
      company: 'Meta',
      location: 'Menlo Park, CA',
      remote: false,
      description: 'Summer internship program for computer science students interested in full-stack development.',
      full_description: 'Join Meta\'s world-class engineering team as a software engineering intern. Work on real products used by billions of people while learning from industry experts.',
      requirements: JSON.stringify([
        'CS/Engineering student',
        'Experience with React or similar frameworks',
        'Strong problem-solving skills',
        'Available for 12-week program'
      ]),
      benefits: JSON.stringify([
        'Competitive salary',
        'Housing stipend',
        'Mentorship program',
        'Full-time conversion opportunity'
      ]),
      amount: JSON.stringify({
        value: 8500,
        currency: 'USD',
        type: 'salary'
      }),
      duration: '12 weeks',
      commitment: 'Full-time',
      posted_by: '550e8400-e29b-41d4-a716-446655440002', // Sarah Davis
      tags: JSON.stringify(['Software Engineering', 'React', 'Full Stack', 'Meta']),
      applicants: 892,
      deadline: '2024-03-31',
      featured: true,
      urgent: false,
      boost: 4,
      experience_level: 'mid',
      category: 'Technology',
      eligibility: JSON.stringify([
        'University student (Junior/Senior)',
        'CS or related field',
        'Previous internship experience preferred'
      ]),
      application_link: 'https://meta.com/careers/students',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440003',
      title: 'Microsoft AI for Good Scholarship',
      type: 'scholarship',
      company: 'Microsoft',
      location: 'Global',
      remote: true,
      description: 'Scholarship program for students working on AI projects that address social challenges.',
      full_description: 'Microsoft AI for Good Scholarship supports students developing AI solutions for humanitarian challenges, environmental sustainability, accessibility, and social equity.',
      requirements: JSON.stringify([
        'Undergraduate or graduate student',
        'Working on AI for social impact',
        'Strong academic record',
        'Project proposal required'
      ]),
      benefits: JSON.stringify([
        '$15,000 scholarship',
        'Azure credits',
        'Mentorship from Microsoft AI researchers',
        'Opportunity to present at Microsoft events'
      ]),
      amount: JSON.stringify({
        value: 15000,
        currency: 'USD',
        type: 'award'
      }),
      duration: '1 year',
      posted_by: '550e8400-e29b-41d4-a716-446655440001', // John Smith
      tags: JSON.stringify(['AI', 'Social Impact', 'Scholarship', 'Microsoft']),
      applicants: 456,
      deadline: '2024-05-15',
      featured: true,
      urgent: false,
      boost: 5,
      experience_level: 'any',
      category: 'Education',
      eligibility: JSON.stringify([
        'Full-time student',
        'AI/ML focus area',
        'Social impact project'
      ]),
      application_link: 'https://microsoft.com/ai-for-good-scholarship',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440004',
      title: 'Stanford Tech Entrepreneurship Accelerator',
      type: 'accelerator',
      company: 'Stanford University',
      location: 'Stanford, CA',
      remote: false,
      description: '6-month accelerator program for student entrepreneurs building tech startups.',
      full_description: 'Intensive accelerator program providing mentorship, funding, and resources for student entrepreneurs. Participants get access to Stanford\'s network, funding opportunities, and expert guidance.',
      requirements: JSON.stringify([
        'Student or recent graduate',
        'Tech startup idea or prototype',
        'Commitment to program duration',
        'Team of 2-4 members'
      ]),
      benefits: JSON.stringify([
        'Up to $100K funding',
        'Office space at Stanford',
        'Mentorship from industry experts',
        'Demo day presentation'
      ]),
      amount: JSON.stringify({
        value: 100000,
        currency: 'USD',
        type: 'funding'
      }),
      duration: '6 months',
      commitment: 'Full-time',
      posted_by: '550e8400-e29b-41d4-a716-446655440006', // David Chen
      tags: JSON.stringify(['Entrepreneurship', 'Startup', 'Accelerator', 'Stanford']),
      applicants: 123,
      deadline: '2024-04-30',
      featured: false,
      urgent: true,
      boost: 3,
      experience_level: 'mid',
      category: 'Entrepreneurship',
      eligibility: JSON.stringify([
        'Student or recent graduate',
        'Tech startup focus',
        'Available for 6 months'
      ]),
      application_link: 'https://stanford.edu/startup-accelerator',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440005',
      title: 'Data Science Bootcamp - Full Scholarship',
      type: 'scholarship',
      company: 'DataCamp',
      location: 'Online',
      remote: true,
      description: 'Full scholarship for underrepresented minorities in tech to attend intensive data science bootcamp.',
      full_description: 'Comprehensive 6-month data science bootcamp with job placement assistance. Designed for underrepresented groups to break into data science careers.',
      requirements: JSON.stringify([
        'Underrepresented minority in tech',
        'Basic programming experience',
        'Commitment to career change',
        'Available for full-time program'
      ]),
      benefits: JSON.stringify([
        'Full tuition waiver ($12,000 value)',
        'Job placement assistance',
        'Career coaching',
        'Alumni network access'
      ]),
      amount: JSON.stringify({
        value: 12000,
        currency: 'USD',
        type: 'award'
      }),
      duration: '6 months',
      commitment: 'Full-time',
      posted_by: '550e8400-e29b-41d4-a716-446655440005', // TechStartup Inc
      tags: JSON.stringify(['Data Science', 'Bootcamp', 'Diversity', 'Career Change']),
      applicants: 67,
      deadline: '2024-03-20',
      featured: false,
      urgent: true,
      boost: 2,
      experience_level: 'entry',
      category: 'Education',
      eligibility: JSON.stringify([
        'Underrepresented minority',
        'Basic programming skills',
        'Career change commitment'
      ]),
      application_link: 'https://datacamp.com/diversity-scholarship',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('opportunities').insert(opportunities);
};
