/**
 * Sanitize user input to prevent XSS attacks
 * Removes potentially dangerous HTML/JS code
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  // Remove script tags and their content first (before stripping other tags)
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Limit length to prevent DoS
  const MAX_LENGTH = 5000
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }
  
  return sanitized
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize and validate question input
 */
export function sanitizeQuestion(question: string): string {
  const sanitized = sanitizeInput(question)
  
  // Minimum length check
  if (sanitized.length < 3) {
    throw new Error('Klausimas per trumpas (min. 3 simboliai)')
  }
  
  // Maximum length check
  if (sanitized.length > 500) {
    throw new Error('Klausimas per ilgas (max. 500 simbolių)')
  }
  
  return sanitized
}

/**
 * Sanitize notes/reflection input
 */
export function sanitizeNotes(notes: string): string {
  const sanitized = sanitizeInput(notes)
  
  // Maximum length check
  if (sanitized.length > 2000) {
    throw new Error('Užrašas per ilgas (max. 2000 simbolių)')
  }
  
  return sanitized
}
