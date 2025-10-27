#!/usr/bin/env node

/**
 * 🧰 IMMUNITY RULE - Deployment Guard Script
 * Prevents deployment if backend fails any critical checks
 * Must be run before any git push or deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛡️  DevOps Guardian - Deployment Guard Starting...\n');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPassed(checkName) {
  log('green', `✅ ${checkName} - PASSED`);
}

function checkFailed(checkName, error) {
  log('red', `❌ ${checkName} - FAILED`);
  log('red', `   Error: ${error}`);
}

function checkWarning(checkName, warning) {
  log('yellow', `⚠️  ${checkName} - WARNING`);
  log('yellow', `   ${warning}`);
}

async function runCheck(checkName, checkFunction) {
  try {
    await checkFunction();
    checkPassed(checkName);
    return true;
  } catch (error) {
    checkFailed(checkName, error.message);
    return false;
  }
}

// Check 1: Verify all required files exist
async function checkRequiredFiles() {
  const requiredFiles = [
    'src/server.js',
    'src/app.js',
    'src/utils/validation.js',
    'src/middleware/errorHandler.js',
    'src/middleware/requestLogger.js',
    'src/controllers/projectController.js',
    'src/controllers/feedController.js',
    'package.json'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file missing: ${file}`);
    }
  }
}

// Check 2: Verify package.json has correct scripts
async function checkPackageJson() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['start', 'dev', 'test'];
  for (const script of requiredScripts) {
    if (!packageJson.scripts[script]) {
      throw new Error(`Missing required script: ${script}`);
    }
  }
  
  if (!packageJson.main || packageJson.main !== 'src/server.js') {
    throw new Error('package.json main field must point to src/server.js');
  }
}

// Check 3: Verify all routes are properly mounted
async function checkRoutesMounted() {
  const appContent = fs.readFileSync('src/app.js', 'utf8');
  
  const requiredRoutes = [
    '/api/health',
    '/api/auth',
    '/api/projects',
    '/api/feed',
    '/api/tasks',
    '/api/placeholder'
  ];
  
  for (const route of requiredRoutes) {
    if (!appContent.includes(`app.use('${route}'`)) {
      throw new Error(`Route not mounted: ${route}`);
    }
  }
}

// Check 4: Verify validation schemas are defined
async function checkValidationSchemas() {
  const validationContent = fs.readFileSync('src/utils/validation.js', 'utf8');
  
  const requiredSchemas = [
    'createProject',
    'createActivity',
    'register',
    'login'
  ];
  
  for (const schema of requiredSchemas) {
    if (!validationContent.includes(`'${schema}':`)) {
      throw new Error(`Validation schema missing: ${schema}`);
    }
  }
}

// Check 5: Verify error handling is comprehensive
async function checkErrorHandling() {
  const errorHandlerContent = fs.readFileSync('src/middleware/errorHandler.js', 'utf8');
  
  const requiredErrorTypes = [
    'ValidationError',
    'UnauthorizedError',
    'ForbiddenError',
    'NotFoundError',
    'ConflictError'
  ];
  
  for (const errorType of requiredErrorTypes) {
    if (!errorHandlerContent.includes(errorType)) {
      throw new Error(`Error type not handled: ${errorType}`);
    }
  }
}

// Check 6: Verify logging is implemented
async function checkLogging() {
  const projectController = fs.readFileSync('src/controllers/projectController.js', 'utf8');
  const feedController = fs.readFileSync('src/controllers/feedController.js', 'utf8');
  
  const requiredLogs = [
    'console.log("📩',
    'console.log("✅',
    'console.log("❌'
  ];
  
  for (const log of requiredLogs) {
    if (!projectController.includes(log) || !feedController.includes(log)) {
      throw new Error(`Missing required logging: ${log}`);
    }
  }
}

// Check 7: Run syntax validation
async function checkSyntax() {
  try {
    execSync('node -c src/server.js', { stdio: 'pipe' });
    execSync('node -c src/app.js', { stdio: 'pipe' });
    execSync('node -c src/utils/validation.js', { stdio: 'pipe' });
    execSync('node -c src/middleware/errorHandler.js', { stdio: 'pipe' });
    execSync('node -c src/middleware/requestLogger.js', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Syntax errors detected in source files');
  }
}

// Check 8: Verify environment variables are documented
async function checkEnvironmentVariables() {
  const envExample = 'env.example';
  if (!fs.existsSync(envExample)) {
    checkWarning('Environment Variables', 'env.example file not found');
    return;
  }
  
  const envContent = fs.readFileSync(envExample, 'utf8');
  const requiredVars = ['PORT', 'JWT_SECRET', 'DATABASE_URL'];
  
  for (const envVar of requiredVars) {
    if (!envContent.includes(envVar)) {
      checkWarning('Environment Variables', `Missing ${envVar} in env.example`);
    }
  }
}

// Main execution
async function main() {
  log('blue', '🔍 Running DevOps Guardian checks...\n');
  
  const checks = [
    ['Required Files', checkRequiredFiles],
    ['Package.json Configuration', checkPackageJson],
    ['Routes Mounted', checkRoutesMounted],
    ['Validation Schemas', checkValidationSchemas],
    ['Error Handling', checkErrorHandling],
    ['Logging Implementation', checkLogging],
    ['Syntax Validation', checkSyntax],
    ['Environment Variables', checkEnvironmentVariables]
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [checkName, checkFunction] of checks) {
    const result = await runCheck(checkName, checkFunction);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  log('blue', `📊 Deployment Guard Results:`);
  log('green', `   ✅ Passed: ${passed}`);
  log('red', `   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    log('red', '\n🚫 DEPLOYMENT BLOCKED');
    log('red', '   Fix all failed checks before deploying');
    process.exit(1);
  } else {
    log('green', '\n🚀 DEPLOYMENT APPROVED');
    log('green', '   All checks passed - safe to deploy');
    process.exit(0);
  }
}

// Run the deployment guard
main().catch(error => {
  log('red', `\n💥 Deployment Guard crashed: ${error.message}`);
  process.exit(1);
});
