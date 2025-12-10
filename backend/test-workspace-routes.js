// Test script for all workspace endpoints
// Run with: node test-workspace-routes.js

const API_BASE = 'http://localhost:3001/api';
const PROJECT_ID = '1'; // Test project ID

// Get auth token (you'll need to set this manually or get it from localStorage)
// For testing, we'll try without auth first to see 401 vs 404
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

const headers = AUTH_TOKEN ? {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
} : {
  'Content-Type': 'application/json'
};

async function testEndpoint(method, path, body = null) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({ error: 'No JSON response' }));
    
    return {
      status: response.status,
      ok: response.ok,
      path,
      method,
      data: data.error ? data : (Array.isArray(data) ? `Array(${data.length})` : 'Object'),
      error: data.error
    };
  } catch (error) {
    return {
      status: 'ERROR',
      ok: false,
      path,
      method,
      error: error.message
    };
  }
}

async function testAllEndpoints() {
  console.log('🧪 Testing all workspace endpoints...\n');
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Auth Token: ${AUTH_TOKEN ? 'Provided' : 'Missing (will get 401)'}\n`);
  
  const endpoints = [
    // Test route
    { method: 'GET', path: '/workspace/test' },
    
    // Members
    { method: 'GET', path: `/workspace/${PROJECT_ID}/members` },
    
    // Sessions
    { method: 'GET', path: `/workspace/${PROJECT_ID}/sessions` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/sessions`, body: { title: 'Test Session', type: 'mentoring', scheduledDate: new Date().toISOString() } },
    
    // Tasks
    { method: 'GET', path: `/workspace/${PROJECT_ID}/tasks` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/tasks`, body: { title: 'Test Task', status: 'todo', priority: 'medium' } },
    
    // Messages
    { method: 'GET', path: `/workspace/${PROJECT_ID}/messages` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/messages`, body: { content: 'Test message', type: 'text' } },
    
    // Voice Notes
    { method: 'GET', path: `/workspace/${PROJECT_ID}/voice-notes` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/voice-notes`, body: { title: 'Test Note', duration: 30, url: 'test.mp3' } },
    
    // Learning Content
    { method: 'GET', path: `/workspace/${PROJECT_ID}/learning-content` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/learning-content`, body: { title: 'Test Content', type: 'video', category: 'skills' } },
    
    // Recordings
    { method: 'GET', path: `/workspace/${PROJECT_ID}/recordings` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/recordings`, body: { title: 'Test Recording', duration: 60, url: 'test.mp4' } },
    
    // Deliverables
    { method: 'GET', path: `/workspace/${PROJECT_ID}/deliverables` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/deliverables`, body: { title: 'Test Deliverable', type: 'document', status: 'draft' } },
    
    // Certificates
    { method: 'GET', path: `/workspace/${PROJECT_ID}/certificates` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/certificates`, body: { title: 'Test Certificate', type: 'completion', status: 'pending' } },
    
    // Live Sessions
    { method: 'GET', path: `/workspace/${PROJECT_ID}/live-sessions` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/live-sessions`, body: { title: 'Test Live Session', status: 'scheduled' } },
    
    // Research Sources
    { method: 'GET', path: `/workspace/${PROJECT_ID}/research-sources` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/research-sources`, body: { title: 'Test Source', type: 'article', url: 'https://example.com' } },
    
    // Research Notes
    { method: 'GET', path: `/workspace/${PROJECT_ID}/research-notes` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/research-notes`, body: { title: 'Test Note', content: 'Test content', tags: ['test'] } },
    
    // Data Sets
    { method: 'GET', path: `/workspace/${PROJECT_ID}/data-sets` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/data-sets`, body: { name: 'Test Dataset', type: 'csv', description: 'Test dataset' } },
    
    // Stakeholders
    { method: 'GET', path: `/workspace/${PROJECT_ID}/stakeholders` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/stakeholders`, body: { name: 'Test Stakeholder', role: 'partner', email: 'test@example.com' } },
    
    // Impact Stories
    { method: 'GET', path: `/workspace/${PROJECT_ID}/impact-stories` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/impact-stories`, body: { title: 'Test Story', content: 'Test content', category: 'education' } },
    
    // Community Events
    { method: 'GET', path: `/workspace/${PROJECT_ID}/community-events` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/community-events`, body: { title: 'Test Event', date: new Date().toISOString(), location: 'Test Location' } },
    
    // Ideas
    { method: 'GET', path: `/workspace/${PROJECT_ID}/ideas` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/ideas`, body: { title: 'Test Idea', description: 'Test description', category: 'innovation' } },
    
    // Co-Creation Rooms
    { method: 'GET', path: `/workspace/${PROJECT_ID}/co-creation-rooms` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/co-creation-rooms`, body: { name: 'Test Room', description: 'Test room', status: 'active' } },
    
    // Project Workspaces
    { method: 'GET', path: `/workspace/${PROJECT_ID}/workspaces` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/workspaces`, body: { name: 'Test Workspace', description: 'Test workspace' } },
    
    // Build Tools
    { method: 'GET', path: `/workspace/${PROJECT_ID}/build-tools` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/build-tools`, body: { name: 'Test Tool', type: 'api', config: {} } },
    
    // Milestones
    { method: 'GET', path: `/workspace/${PROJECT_ID}/milestones` },
    { method: 'POST', path: `/workspace/${PROJECT_ID}/milestones`, body: { title: 'Test Milestone', targetDate: new Date().toISOString(), status: 'pending' } },
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.path, endpoint.body);
    results.push(result);
    
    const statusIcon = result.ok ? '✅' : result.status === 401 ? '🔒' : result.status === 404 ? '❌' : '⚠️';
    console.log(`${statusIcon} ${endpoint.method} ${endpoint.path} - ${result.status} ${result.error || result.data || ''}`);
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Summary:');
  const success = results.filter(r => r.ok).length;
  const authErrors = results.filter(r => r.status === 401).length;
  const notFound = results.filter(r => r.status === 404).length;
  const otherErrors = results.filter(r => !r.ok && r.status !== 401 && r.status !== 404).length;
  
  console.log(`✅ Success: ${success}`);
  console.log(`🔒 Auth Required (401): ${authErrors}`);
  console.log(`❌ Not Found (404): ${notFound}`);
  console.log(`⚠️  Other Errors: ${otherErrors}`);
  
  if (notFound > 0) {
    console.log('\n❌ Endpoints returning 404 (routes not found):');
    results.filter(r => r.status === 404).forEach(r => {
      console.log(`   ${r.method} ${r.path}`);
    });
  }
}

// Run tests
testAllEndpoints().catch(console.error);

