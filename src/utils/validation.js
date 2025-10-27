const logger = require('./logger');

/**
 * 🔒 VALIDATION LAW - Schema validation system
 * Validates incoming payloads against expected schemas
 * Logs schema diffs and applies auto-correction mapping
 */

class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Schema definitions for all API endpoints
 */
const SCHEMAS = {
  // Auth schemas
  register: {
    required: ['email', 'password', 'firstName', 'lastName'],
    optional: ['phone'],
    types: {
      email: 'string',
      password: 'string',
      firstName: 'string',
      lastName: 'string',
      phone: 'string'
    }
  },
  login: {
    required: ['email', 'password'],
    optional: [],
    types: {
      email: 'string',
      password: 'string'
    }
  },
  
  // Project schemas
  createProject: {
    required: ['title', 'description'],
    optional: ['category', 'status', 'priority', 'dueDate', 'tags'],
    types: {
      title: 'string',
      description: 'string',
      category: 'string',
      status: 'string',
      priority: 'string',
      dueDate: 'string',
      tags: 'array'
    }
  },
  updateProject: {
    required: [],
    optional: ['title', 'description', 'category', 'status', 'priority', 'dueDate', 'tags'],
    types: {
      title: 'string',
      description: 'string',
      category: 'string',
      status: 'string',
      priority: 'string',
      dueDate: 'string',
      tags: 'array'
    }
  },
  
  // Task schemas
  createTask: {
    required: ['title'],
    optional: ['description', 'priority', 'dueDate', 'status'],
    types: {
      title: 'string',
      description: 'string',
      priority: 'string',
      dueDate: 'string',
      status: 'string'
    }
  },
  updateTask: {
    required: [],
    optional: ['title', 'description', 'priority', 'dueDate', 'status'],
    types: {
      title: 'string',
      description: 'string',
      priority: 'string',
      dueDate: 'string',
      status: 'string'
    }
  },
  
  // Feed schemas
  createActivity: {
    required: ['type', 'title'],
    optional: ['description', 'category', 'metadata', 'projectId'],
    types: {
      type: 'string',
      title: 'string',
      description: 'string',
      category: 'string',
      metadata: 'object',
      projectId: 'string'
    }
  }
};

/**
 * Auto-correction mapping for common field mismatches
 */
const FIELD_MAPPINGS = {
  // Project field mappings
  'name': 'title',
  'desc': 'description',
  'cat': 'category',
  'pri': 'priority',
  'due': 'dueDate',
  
  // User field mappings
  'first_name': 'firstName',
  'last_name': 'lastName',
  'firstname': 'firstName',
  'lastname': 'lastName',
  'user_id': 'userId',
  'userid': 'userId',
  
  // Task field mappings
  'task_title': 'title',
  'task_desc': 'description',
  'task_priority': 'priority',
  'task_due': 'dueDate'
};

/**
 * Validate payload against schema
 * @param {Object} payload - The incoming payload
 * @param {string} schemaName - The schema name to validate against
 * @param {Object} options - Validation options
 * @returns {Object} - Validated and corrected payload
 */
function validatePayload(payload, schemaName, options = {}) {
  const { autoCorrect = true, strict = false } = options;
  const schema = SCHEMAS[schemaName];
  
  if (!schema) {
    throw new ValidationError(`Unknown schema: ${schemaName}`);
  }
  
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('Payload must be an object');
  }
  
  // Create a copy of the payload for processing
  let processedPayload = { ...payload };
  
  // Apply auto-correction mapping
  if (autoCorrect) {
    processedPayload = applyFieldMappings(processedPayload, schemaName);
  }
  
  // Check for missing required fields
  const missingFields = schema.required.filter(field => 
    processedPayload[field] === undefined || processedPayload[field] === null
  );
  
  if (missingFields.length > 0) {
    const error = new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields, schema: schemaName }
    );
    
    logger.warn({
      schema: schemaName,
      missingFields,
      receivedPayload: payload,
      processedPayload
    }, '❌ Validation failed - missing required fields');
    
    throw error;
  }
  
  // Validate field types
  const typeErrors = [];
  Object.keys(processedPayload).forEach(field => {
    const expectedType = schema.types[field];
    if (expectedType && !isValidType(processedPayload[field], expectedType)) {
      typeErrors.push({
        field,
        expected: expectedType,
        actual: typeof processedPayload[field]
      });
    }
  });
  
  if (typeErrors.length > 0) {
    const error = new ValidationError(
      `Type validation failed for fields: ${typeErrors.map(e => e.field).join(', ')}`,
      { typeErrors, schema: schemaName }
    );
    
    logger.warn({
      schema: schemaName,
      typeErrors,
      receivedPayload: payload,
      processedPayload
    }, '❌ Validation failed - type mismatches');
    
    throw error;
  }
  
  // Log successful validation
  logger.info({
    schema: schemaName,
    fieldCount: Object.keys(processedPayload).length,
    requiredFields: schema.required.length
  }, '✅ Payload validation successful');
  
  return processedPayload;
}

/**
 * Apply field mappings for auto-correction
 */
function applyFieldMappings(payload, schemaName) {
  const corrected = { ...payload };
  let corrections = [];
  
  Object.keys(payload).forEach(field => {
    const mappedField = FIELD_MAPPINGS[field];
    if (mappedField && !corrected[mappedField]) {
      corrected[mappedField] = corrected[field];
      delete corrected[field];
      corrections.push({ from: field, to: mappedField });
    }
  });
  
  if (corrections.length > 0) {
    logger.info({
      schema: schemaName,
      corrections,
      originalPayload: payload,
      correctedPayload: corrected
    }, '🔧 Applied field mappings for auto-correction');
  }
  
  return corrected;
}

/**
 * Check if value matches expected type
 */
function isValidType(value, expectedType) {
  if (expectedType === 'array') {
    return Array.isArray(value);
  }
  
  if (expectedType === 'object') {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  
  return typeof value === expectedType;
}

/**
 * Sanitize string inputs
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Sanitize payload strings
 */
function sanitizePayload(payload) {
  const sanitized = { ...payload };
  
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    }
  });
  
  return sanitized;
}

module.exports = {
  validatePayload,
  sanitizePayload,
  ValidationError,
  SCHEMAS
};
