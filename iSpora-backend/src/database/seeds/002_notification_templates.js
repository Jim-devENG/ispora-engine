exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('notification_templates').del();
  
  // Get category IDs
  const categories = await knex('notification_categories').select('id', 'name');
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });
  
  // Inserts seed entries
  return knex('notification_templates').insert([
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'project_member_joined',
      type: 'project',
      category_id: categoryMap['project_updates'],
      title_template: 'New team member joined {{project_title}}',
      message_template: '{{member_name}} has joined your project "{{project_title}}". Review their profile and assign them to appropriate tasks.',
      variables: JSON.stringify(['project_title', 'member_name', 'project_id']),
      default_metadata: JSON.stringify({
        action_required: true,
        priority: 'medium',
        related_entity_type: 'project',
        action_data: {
          primary: {
            label: 'Review Member',
            action: 'navigate_project',
            params: { projectId: '{{project_id}}', tab: 'members' }
          },
          secondary: {
            label: 'View Project',
            action: 'navigate_project',
            params: { projectId: '{{project_id}}' }
          }
        }
      }),
      priority: 'medium',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'project_milestone_completed',
      type: 'project',
      category_id: categoryMap['project_updates'],
      title_template: 'Milestone completed: {{milestone_title}}',
      message_template: 'Great news! The milestone "{{milestone_title}}" has been completed in {{project_title}}. {{completion_message}}',
      variables: JSON.stringify(['milestone_title', 'project_title', 'completion_message', 'project_id']),
      default_metadata: JSON.stringify({
        action_required: false,
        priority: 'low',
        related_entity_type: 'project',
        action_data: {
          primary: {
            label: 'View Project',
            action: 'navigate_project',
            params: { projectId: '{{project_id}}' }
          }
        }
      }),
      priority: 'low',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'mentorship_session_scheduled',
      type: 'mentorship',
      category_id: categoryMap['mentorship'],
      title_template: 'Mentorship session scheduled',
      message_template: 'Your mentorship session with {{mentor_name}} is scheduled for {{session_date}} at {{session_time}}. Topic: {{session_topic}}',
      variables: JSON.stringify(['mentor_name', 'session_date', 'session_time', 'session_topic', 'session_id']),
      default_metadata: JSON.stringify({
        action_required: true,
        priority: 'high',
        related_entity_type: 'session',
        action_data: {
          primary: {
            label: 'Join Session',
            action: 'navigate_session',
            params: { sessionId: '{{session_id}}' }
          },
          secondary: {
            label: 'View Details',
            action: 'navigate_session_details',
            params: { sessionId: '{{session_id}}' }
          }
        }
      }),
      priority: 'high',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'opportunity_application_status',
      type: 'opportunity',
      category_id: categoryMap['opportunities'],
      title_template: 'Application status update: {{opportunity_title}}',
      message_template: 'Your application for "{{opportunity_title}}" at {{company_name}} has been {{status}}. {{status_message}}',
      variables: JSON.stringify(['opportunity_title', 'company_name', 'status', 'status_message', 'opportunity_id']),
      default_metadata: JSON.stringify({
        action_required: false,
        priority: 'medium',
        related_entity_type: 'opportunity',
        action_data: {
          primary: {
            label: 'View Opportunity',
            action: 'navigate_opportunity',
            params: { opportunityId: '{{opportunity_id}}' }
          }
        }
      }),
      priority: 'medium',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'connection_request_received',
      type: 'connection',
      category_id: categoryMap['connections'],
      title_template: 'New connection request from {{requester_name}}',
      message_template: '{{requester_name}} wants to connect with you. {{connection_message}}',
      variables: JSON.stringify(['requester_name', 'connection_message', 'requester_id']),
      default_metadata: JSON.stringify({
        action_required: true,
        priority: 'medium',
        related_entity_type: 'user',
        action_data: {
          primary: {
            label: 'Accept',
            action: 'accept_connection',
            params: { requesterId: '{{requester_id}}' }
          },
          secondary: {
            label: 'View Profile',
            action: 'navigate_profile',
            params: { userId: '{{requester_id}}' }
          }
        }
      }),
      priority: 'medium',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'badge_earned',
      type: 'achievement',
      category_id: categoryMap['achievements'],
      title_template: 'Congratulations! You earned the {{badge_name}} badge',
      message_template: 'You have successfully earned the "{{badge_name}}" badge! {{badge_description}}',
      variables: JSON.stringify(['badge_name', 'badge_description', 'badge_id']),
      default_metadata: JSON.stringify({
        action_required: false,
        priority: 'low',
        related_entity_type: 'badge',
        action_data: {
          primary: {
            label: 'View Badge',
            action: 'navigate_badge',
            params: { badgeId: '{{badge_id}}' }
          },
          secondary: {
            label: 'Share Achievement',
            action: 'share_achievement',
            params: { badgeId: '{{badge_id}}' }
          }
        }
      }),
      priority: 'low',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'),
      name: 'system_maintenance',
      type: 'system',
      category_id: categoryMap['system'],
      title_template: 'Scheduled system maintenance',
      message_template: 'We will be performing scheduled maintenance on {{maintenance_date}} from {{start_time}} to {{end_time}}. The system may be temporarily unavailable during this time.',
      variables: JSON.stringify(['maintenance_date', 'start_time', 'end_time']),
      default_metadata: JSON.stringify({
        action_required: false,
        priority: 'medium',
        related_entity_type: 'system',
        action_data: {
          primary: {
            label: 'Learn More',
            action: 'navigate_system_status',
            params: {}
          }
        }
      }),
      priority: 'medium',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
