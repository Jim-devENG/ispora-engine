exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('feed_entries').del();
  
  // Inserts seed entries
  await knex('feed_entries').insert([
    {
      id: '00000000-0000-0000-0000-000000000201',
      type: 'project',
      title: 'New Project: Diaspora Connect Platform',
      description: 'Demo User created a new project to connect diaspora professionals.',
      category: 'technology',
      metadata: JSON.stringify({
        project_id: '00000000-0000-0000-0000-000000000101',
        action: 'created',
        priority: 'high'
      }),
      user_id: '00000000-0000-0000-0000-000000000001',
      project_id: '00000000-0000-0000-0000-000000000101',
      is_public: true,
      likes: 5,
      comments: 2,
      shares: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000202',
      type: 'activity',
      title: 'Community Outreach Initiative Started',
      description: 'Admin User initiated a community outreach program.',
      category: 'social',
      metadata: JSON.stringify({
        action: 'started',
        location: 'Local University',
        participants: 10
      }),
      user_id: '00000000-0000-0000-0000-000000000002',
      project_id: '00000000-0000-0000-0000-000000000102',
      is_public: true,
      likes: 3,
      comments: 1,
      shares: 0,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
  
  console.log('✅ Seeded feed_entries table');
};
