// Supabase Realtime Subscriptions
// This file replaces WebSocket and SSE implementations with Supabase Realtime

import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeEventHandler {
  (payload: any): void;
}

/**
 * Subscribe to project changes
 */
export function subscribeToProject(
  projectId: string,
  handlers: {
    onUpdate?: RealtimeEventHandler;
    onDelete?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`project:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onDelete?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to feed items
 */
export function subscribeToFeed(
  handlers: {
    onInsert?: RealtimeEventHandler;
    onUpdate?: RealtimeEventHandler;
    onDelete?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel('feed_items')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feed_items',
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'feed_items',
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'feed_items',
      },
      (payload) => {
        handlers.onDelete?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project tasks
 */
export function subscribeToProjectTasks(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
    onUpdate?: RealtimeEventHandler;
    onDelete?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`tasks:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onDelete?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project sessions
 */
export function subscribeToProjectSessions(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
    onUpdate?: RealtimeEventHandler;
    onDelete?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`sessions:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sessions',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'sessions',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onDelete?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project messages
 */
export function subscribeToProjectMessages(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
    onUpdate?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project voice notes
 */
export function subscribeToProjectVoiceNotes(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
    onDelete?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`voice_notes:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'voice_notes',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'voice_notes',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onDelete?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project stakeholders
 */
export function subscribeToProjectStakeholders(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
    onUpdate?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`stakeholders:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'stakeholders',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'stakeholders',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project impact stories
 */
export function subscribeToProjectImpactStories(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`impact_stories:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'impact_stories',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project community events
 */
export function subscribeToProjectCommunityEvents(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`community_events:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_events',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project ideas
 */
export function subscribeToProjectIdeas(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
    onUpdate?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`ideas:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ideas',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'ideas',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project research sources
 */
export function subscribeToProjectResearchSources(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
    onUpdate?: RealtimeEventHandler;
    onDelete?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`research_sources:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'research_sources',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'research_sources',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'research_sources',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onDelete?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to project research notes
 */
export function subscribeToProjectResearchNotes(
  projectId: string,
  handlers: {
    onInsert?: RealtimeEventHandler;
    onUpdate?: RealtimeEventHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`research_notes:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'research_notes',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'research_notes',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        handlers.onUpdate?.(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to all workspace events for a project
 * This is a convenience function that subscribes to multiple tables at once
 */
export function subscribeToWorkspace(
  projectId: string,
  handlers: {
    onTaskCreated?: RealtimeEventHandler;
    onTaskUpdated?: RealtimeEventHandler;
    onTaskDeleted?: RealtimeEventHandler;
    onSessionCreated?: RealtimeEventHandler;
    onSessionUpdated?: RealtimeEventHandler;
    onSessionDeleted?: RealtimeEventHandler;
    onMessageSent?: RealtimeEventHandler;
    onVoiceNoteCreated?: RealtimeEventHandler;
    onStakeholderCreated?: RealtimeEventHandler;
    onImpactStoryCreated?: RealtimeEventHandler;
    onCommunityEventCreated?: RealtimeEventHandler;
    onIdeaCreated?: RealtimeEventHandler;
    onIdeaUpdated?: RealtimeEventHandler;
    onResearchSourceCreated?: RealtimeEventHandler;
    onResearchSourceUpdated?: RealtimeEventHandler;
    onResearchSourceDeleted?: RealtimeEventHandler;
    onResearchNoteCreated?: RealtimeEventHandler;
    onResearchNoteUpdated?: RealtimeEventHandler;
  }
): RealtimeChannel[] {
  const channels: RealtimeChannel[] = [];

  // Subscribe to tasks
  if (handlers.onTaskCreated || handlers.onTaskUpdated || handlers.onTaskDeleted) {
    channels.push(
      subscribeToProjectTasks(projectId, {
        onInsert: handlers.onTaskCreated,
        onUpdate: handlers.onTaskUpdated,
        onDelete: handlers.onTaskDeleted,
      })
    );
  }

  // Subscribe to sessions
  if (handlers.onSessionCreated || handlers.onSessionUpdated || handlers.onSessionDeleted) {
    channels.push(
      subscribeToProjectSessions(projectId, {
        onInsert: handlers.onSessionCreated,
        onUpdate: handlers.onSessionUpdated,
        onDelete: handlers.onSessionDeleted,
      })
    );
  }

  // Subscribe to messages
  if (handlers.onMessageSent) {
    channels.push(
      subscribeToProjectMessages(projectId, {
        onInsert: handlers.onMessageSent,
      })
    );
  }

  // Subscribe to voice notes
  if (handlers.onVoiceNoteCreated) {
    channels.push(
      subscribeToProjectVoiceNotes(projectId, {
        onInsert: handlers.onVoiceNoteCreated,
      })
    );
  }

  // Subscribe to stakeholders
  if (handlers.onStakeholderCreated) {
    channels.push(
      subscribeToProjectStakeholders(projectId, {
        onInsert: handlers.onStakeholderCreated,
      })
    );
  }

  // Subscribe to impact stories
  if (handlers.onImpactStoryCreated) {
    channels.push(
      subscribeToProjectImpactStories(projectId, {
        onInsert: handlers.onImpactStoryCreated,
      })
    );
  }

  // Subscribe to community events
  if (handlers.onCommunityEventCreated) {
    channels.push(
      subscribeToProjectCommunityEvents(projectId, {
        onInsert: handlers.onCommunityEventCreated,
      })
    );
  }

  // Subscribe to ideas
  if (handlers.onIdeaCreated || handlers.onIdeaUpdated) {
    channels.push(
      subscribeToProjectIdeas(projectId, {
        onInsert: handlers.onIdeaCreated,
        onUpdate: handlers.onIdeaUpdated,
      })
    );
  }

  // Subscribe to research sources
  if (handlers.onResearchSourceCreated || handlers.onResearchSourceUpdated || handlers.onResearchSourceDeleted) {
    channels.push(
      subscribeToProjectResearchSources(projectId, {
        onInsert: handlers.onResearchSourceCreated,
        onUpdate: handlers.onResearchSourceUpdated,
        onDelete: handlers.onResearchSourceDeleted,
      })
    );
  }

  // Subscribe to research notes
  if (handlers.onResearchNoteCreated || handlers.onResearchNoteUpdated) {
    channels.push(
      subscribeToProjectResearchNotes(projectId, {
        onInsert: handlers.onResearchNoteCreated,
        onUpdate: handlers.onResearchNoteUpdated,
      })
    );
  }

  return channels;
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

/**
 * Unsubscribe from multiple channels
 */
export function unsubscribeAll(channels: RealtimeChannel[]): void {
  channels.forEach(channel => unsubscribe(channel));
}

