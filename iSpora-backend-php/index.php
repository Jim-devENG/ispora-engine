<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Dev-Key');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple routing
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove query parameters
$path = parse_url($request_uri, PHP_URL_PATH);

// Health check
if ($path === '/health') {
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('c'),
        'uptime' => 'running',
        'backend' => 'PHP'
    ]);
    exit();
}

// CORS test
if ($path === '/api/cors-test') {
    echo json_encode([
        'success' => true,
        'message' => 'CORS test successful!',
        'timestamp' => date('c'),
        'backend' => 'PHP',
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'No Origin Header'
    ]);
    exit();
}

// Feed endpoint
if ($path === '/api/feed' && $method === 'GET') {
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 50;
    
    // Mock feed data
    $feedItems = [
        [
            'id' => 'feed_1',
            'type' => 'project',
            'title' => 'New Project Created',
            'description' => 'A new project has been created successfully',
            'created_at' => date('c')
        ],
        [
            'id' => 'feed_2',
            'type' => 'session',
            'title' => 'Mentorship Session Scheduled',
            'description' => 'A new mentorship session has been scheduled',
            'created_at' => date('c')
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $feedItems,
        'pagination' => [
            'page' => (int)$page,
            'limit' => (int)$limit,
            'total' => count($feedItems)
        ]
    ]);
    exit();
}

// Projects endpoint
if ($path === '/api/projects' && $method === 'GET') {
    $projects = [
        [
            'id' => 'proj_1',
            'title' => 'My First Project',
            'description' => 'A sample project created with PHP backend',
            'status' => 'active',
            'creator_id' => 'user_1',
            'created_at' => date('c')
        ],
        [
            'id' => 'proj_2',
            'title' => 'Learning Project',
            'description' => 'A project for learning new skills',
            'status' => 'active',
            'creator_id' => 'user_1',
            'created_at' => date('c')
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $projects
    ]);
    exit();
}

// Sessions endpoint
if ($path === '/api/sessions' && $method === 'GET') {
    $sessions = [
        [
            'id' => 'sess_1',
            'project_id' => 'proj_1',
            'title' => 'Project Planning Session',
            'description' => 'Initial planning session for the project',
            'scheduled_at' => date('c', strtotime('+1 day')),
            'duration' => 60,
            'status' => 'upcoming',
            'type' => 'video',
            'created_at' => date('c')
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $sessions
    ]);
    exit();
}

// Tasks endpoint
if ($path === '/api/tasks' && $method === 'GET') {
    $tasks = [
        [
            'id' => 'task_1',
            'project_id' => 'proj_1',
            'title' => 'Complete project setup',
            'description' => 'Set up the initial project structure',
            'status' => 'pending',
            'priority' => 'high',
            'created_at' => date('c')
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $tasks
    ]);
    exit();
}

// Notifications endpoint
if ($path === '/api/notifications' && $method === 'GET') {
    $notifications = [
        [
            'id' => 'notif_1',
            'user_id' => 'user_1',
            'title' => 'Welcome to iSpora!',
            'message' => 'Your account has been created successfully.',
            'type' => 'info',
            'is_read' => false,
            'created_at' => date('c')
        ],
        [
            'id' => 'notif_2',
            'user_id' => 'user_1',
            'title' => 'New Project Created',
            'message' => 'You have created a new project: "My First Project"',
            'type' => 'success',
            'is_read' => false,
            'created_at' => date('c')
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $notifications
    ]);
    exit();
}

// Credits endpoint
if ($path === '/api/credits/overview' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => [
            'total_credits' => 1500,
            'available_credits' => 1200,
            'used_credits' => 300,
            'level' => 'Bronze'
        ]
    ]);
    exit();
}

if ($path === '/api/credits/badges' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => [
            [
                'id' => 'badge_1',
                'name' => 'First Project',
                'description' => 'Created your first project',
                'earned' => true,
                'earned_at' => date('c')
            ]
        ]
    ]);
    exit();
}

if ($path === '/api/credits/activities' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => [
            [
                'id' => 'activity_1',
                'type' => 'project_created',
                'description' => 'Created project: My First Project',
                'credits_earned' => 100,
                'created_at' => date('c')
            ]
        ]
    ]);
    exit();
}

if ($path === '/api/credits/leaderboard' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => [
            [
                'rank' => 1,
                'user_id' => 'user_1',
                'name' => 'John Doe',
                'credits' => 1500,
                'level' => 'Bronze'
            ]
        ]
    ]);
    exit();
}

// Network endpoints
if ($path === '/api/network/connections' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
    exit();
}

if ($path === '/api/network/connections/requests' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
    exit();
}

if ($path === '/api/network/discovery' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
    exit();
}

// Opportunities endpoint
if ($path === '/api/opportunities' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
    exit();
}

// Dev verification
if ($path === '/api/dev/verify' && $method === 'GET') {
    $devKey = $_SERVER['HTTP_X_DEV_KEY'] ?? '';
    if ($devKey === 'CHANGE_ME_STRONG_KEY') {
        echo json_encode([
            'success' => true,
            'message' => 'Dev access granted'
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid dev key'
        ]);
    }
    exit();
}

// Default response
http_response_code(404);
echo json_encode([
    'success' => false,
    'error' => 'Endpoint not found',
    'path' => $path,
    'method' => $method
]);
?>
