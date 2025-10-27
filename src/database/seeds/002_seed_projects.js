exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('projects').del();
  
  // Inserts seed entries
  await knex('projects').insert([
    {
      id: '00000000-0000-0000-0000-000000000101',
      title: 'Diaspora Connect Platform',
      description: 'A platform to connect diaspora professionals with local communities and opportunities.',
      type: 'academic',
      category: 'technology',
      status: 'active',
      tags: JSON.stringify(['technology', 'community', 'networking']),
      objectives: 'Build bridges between diaspora professionals and local communities',
      team_members: JSON.stringify(['Demo User', 'Admin User']),
      diaspora_positions: JSON.stringify(['Software Engineer', 'Project Manager']),
      priority: 'high',
      university: 'Global University',
      mentorship_connection: true,
      is_public: true,
      created_by: '00000000-0000-0000-0000-000000000001',
      likes: 5,
      comments: 2,
      shares: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      title: 'Community Outreach Initiative',
      description: 'An initiative to engage local communities with diaspora expertise.',
      type: 'community',
      category: 'social',
      status: 'active',
      tags: JSON.stringify(['community', 'outreach', 'social-impact']),
      objectives: 'Create meaningful connections between diaspora and local communities',
      team_members: JSON.stringify(['Demo User']),
      diaspora_positions: JSON.stringify(['Community Manager']),
      priority: 'medium',
      university: 'Local University',
      mentorship_connection: false,
      is_public: true,
      created_by: '00000000-0000-0000-0000-000000000002',
      likes: 3,
      comments: 1,
      shares: 0,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
  
  console.log('✅ Seeded projects table');
};
