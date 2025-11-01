/**
 * Security-related type definitions
 * Comprehensive types for authentication, authorization, and security features
 */

// ============================================================================
// Audit Action Types
// ============================================================================

export enum AuditAction {
  // User Management
  USER_CREATED = 'user.created',
  USER_DELETED = 'user.deleted',
  USER_DEACTIVATED = 'user.deactivated',
  USER_ACTIVATED = 'user.activated',
  USER_ROLE_UPDATED = 'user.role.updated',
  USER_PROFILE_UPDATED = 'user.profile.updated',
  USER_UNLOCKED = 'user.unlocked',
  USER_INVITED = 'user.invited',

  // Authentication
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILED = 'auth.login.failed',
  LOGOUT = 'auth.logout',
  PASSWORD_CHANGED = 'password.changed',
  PASSWORD_RESET_REQUESTED = 'password.reset.requested',
  PASSWORD_RESET_COMPLETED = 'password.reset.completed',
  PASSWORD_FORCE_CHANGE = 'password.force_change',

  // Security
  ACCOUNT_LOCKED = 'account.locked',
  ACCOUNT_UNLOCKED = 'account.unlocked',
  TWO_FACTOR_ENABLED = 'two_factor.enabled',
  TWO_FACTOR_DISABLED = 'two_factor.disabled',
  TWO_FACTOR_VERIFIED = 'two_factor.verified',
  BACKUP_CODE_USED = 'backup_code.used',

  // Session Management
  SESSION_CREATED = 'session.created',
  SESSION_TERMINATED = 'session.terminated',
  SESSION_EXPIRED = 'session.expired',

  // Settings
  SECURITY_SETTING_CHANGED = 'security.setting.changed',
  PERMISSION_CHANGED = 'permission.changed',

  // Lead Management
  LEAD_CREATED = 'lead.created',
  LEAD_UPDATED = 'lead.updated',
  LEAD_DELETED = 'lead.deleted',
  LEAD_STATUS_CHANGED = 'lead.status.changed',
  LEAD_PRIORITY_CHANGED = 'lead.priority.changed',
  LEAD_ASSIGNED = 'lead.assigned',
  LEAD_VERIFIED = 'lead.verified',
}

// ============================================================================
// Security Event Types
// ============================================================================

export enum SecurityEventType {
  SUSPICIOUS_LOGIN = 'suspicious_login',
  BRUTE_FORCE_ATTEMPT = 'brute_force',
  ACCOUNT_TAKEOVER_ATTEMPT = 'account_takeover',
  IMPOSSIBLE_TRAVEL = 'impossible_travel',
  UNUSUAL_ACTIVITY = 'unusual_activity',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_EXFILTRATION = 'data_exfiltration',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
}

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Database Table Interfaces
// ============================================================================

export interface LoginAttempt {
  id: string;
  user_id?: string;
  email: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  failure_reason?: string;
  timestamp: string;
  geolocation?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: AuditAction | string;
  resource_type: string;
  resource_id?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface AuditLogWithActor extends AuditLog {
  actor?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: {
    device_type?: string;
    os?: string;
    browser?: string;
  };
  last_activity: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_at?: string;
  ip_address?: string;
}

export interface UserSecuritySettings {
  id: string;
  user_id: string;

  // Password policy
  force_password_change: boolean;
  last_password_change: string;
  password_history: Array<{
    hash: string;
    changed_at: string;
  }>;

  // Account lockout
  account_locked: boolean;
  locked_until?: string;
  locked_reason?: string;
  failed_login_count: number;
  last_failed_login?: string;

  // Two-factor authentication
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  backup_codes?: string[];
  two_factor_verified: boolean;

  // Session settings
  session_timeout_minutes: number;
  require_reauth_for_sensitive: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface SecurityEvent {
  id: string;
  event_type: SecurityEventType | string;
  severity: SecurityEventSeverity;
  user_id?: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface SecurityEventWithUser extends SecurityEvent {
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  resolver?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// ============================================================================
// Security Constants
// ============================================================================

export const SECURITY_CONSTANTS = {
  // Login security
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  LOGIN_ATTEMPT_WINDOW_MINUTES: 10,

  // Password policy
  MIN_PASSWORD_LENGTH: 12,
  PASSWORD_HISTORY_COUNT: 5,
  PASSWORD_EXPIRY_DAYS: 90,

  // Session management
  DEFAULT_SESSION_TIMEOUT_MINUTES: 30,
  SESSION_WARNING_MINUTES: 5,
  MAX_CONCURRENT_SESSIONS: 5,

  // Two-factor authentication
  TOTP_WINDOW: 1, // Allow 1 step before/after for clock drift
  BACKUP_CODES_COUNT: 10,
  BACKUP_CODE_LENGTH: 8,

  // Rate limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MINUTES: 15,
} as const;

// ============================================================================
// Utility Types
// ============================================================================

export interface LoginAttemptResult {
  success: boolean;
  user?: any;
  error?: string;
  isLocked?: boolean;
  lockedUntil?: Date;
  attemptsRemaining?: number;
  requiresTwoFactor?: boolean;
}

export interface AccountLockoutStatus {
  isLocked: boolean;
  lockedUntil?: Date;
  reason?: string;
  attemptsRemaining?: number;
  canUnlock: boolean;
}

export interface PasswordPolicyResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  strength?: 'weak' | 'medium' | 'strong';
}

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface SessionInfo {
  id: string;
  device: string;
  location?: string;
  lastActivity: Date;
  current: boolean;
  canTerminate: boolean;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface RecordLoginAttemptParams {
  email: string;
  success: boolean;
  userId?: string;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogAuditParams {
  action: AuditAction | string;
  resourceType: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

export interface CheckAccountLockoutParams {
  userId: string;
}

export interface UnlockAccountParams {
  userId: string;
  reason?: string;
}

export interface ForcePasswordChangeParams {
  userId: string;
  reason: string;
}

export interface Enable2FAParams {
  userId: string;
  secret: string;
  verificationCode: string;
}

export interface Verify2FAParams {
  userId: string;
  code: string;
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface AuditLogFilters {
  actorId?: string;
  action?: AuditAction | string;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface LoginAttemptFilters {
  userId?: string;
  email?: string;
  success?: boolean;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
}

export interface SecurityEventFilters {
  eventType?: SecurityEventType | string;
  severity?: SecurityEventSeverity;
  resolved?: boolean;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// Security Metrics
// ============================================================================

export interface SecurityMetrics {
  activeUsers24h: number;
  failedLogins24h: number;
  lockedAccounts: number;
  securityEvents24h: number;
  activeSessions: number;
  twoFactorAdoptionRate: number;
  averagePasswordStrength: number;
}

export interface LoginMetrics {
  totalAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  uniqueIPs: number;
  averageAttemptsPerUser: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class AccountLockedError extends SecurityError {
  constructor(
    public lockedUntil?: Date,
    public reason?: string
  ) {
    super(
      `Account is locked${lockedUntil ? ` until ${lockedUntil.toLocaleString()}` : ''}`,
      'ACCOUNT_LOCKED',
      { lockedUntil, reason }
    );
    this.name = 'AccountLockedError';
  }
}

export class TwoFactorRequiredError extends SecurityError {
  constructor() {
    super('Two-factor authentication required', 'TWO_FACTOR_REQUIRED');
    this.name = 'TwoFactorRequiredError';
  }
}

export class PasswordPolicyError extends SecurityError {
  constructor(public violations: string[]) {
    super(
      `Password does not meet policy requirements: ${violations.join(', ')}`,
      'PASSWORD_POLICY_VIOLATION',
      { violations }
    );
    this.name = 'PasswordPolicyError';
  }
}
