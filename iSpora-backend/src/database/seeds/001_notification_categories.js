exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('notification_categories').del();
  
  // Inserts seed entries
  return knex('notification_categories').insert([
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'project_updates',
      display_name: 'Project Updates',
      description: 'Notifications about project activities, milestones, and team updates',
      icon: 'briefcase',
      color: '#3b82f6',
      is_active: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'mentorship',
      display_name: 'Mentorship',
      description: 'Notifications about mentorship activities, sessions, and guidance',
      icon: 'users',
      color: '#10b981',
      is_active: true,
      sort_order: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'opportunities',
      display_name: 'Opportunities',
      description: 'Notifications about new opportunities, applications, and career updates',
      icon: 'target',
      color: '#f59e0b',
      is_active: true,
      sort_order: 3,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'connections',
      display_name: 'Connections',
      description: 'Notifications about connection requests, network updates, and social activities',
      icon: 'user-plus',
      color: '#8b5cf6',
      is_active: true,
      sort_order: 4,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'system',
      display_name: 'System',
      description: 'System notifications, updates, and important announcements',
      icon: 'settings',
      color: '#6b7280',
      is_active: true,
      sort_order: 5,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'achievements',
      display_name: 'Achievements',
      description: 'Notifications about badges, milestones, and accomplishments',
      icon: 'award',
      color: '#f97316',
      is_active: true,
      sort_order: 6,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
