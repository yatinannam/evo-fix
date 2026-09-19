/**
 * Single source of truth for role-based permission checks.
 * Used by Server Components, Server Actions, and (for UI gating only — RLS is the real gate)
 * Client Components in emp-dash.
 *
 * RLS in Supabase is the security boundary. These functions are defense-in-depth
 * and for readable conditional rendering — they do NOT replace RLS policies.
 */
import type { EmpProfile, EmpUserDomain, RoleName } from '@/lib/supabase/types';

// ─── Role hierarchy ───────────────────────────────────────────────────────────

const ROLE_RANK: Record<RoleName, number> = {
  super_admin:  4,
  admin:        3,
  domain_head:  2,
  employee:     1,
};

export function getRoleRank(roleName: RoleName): number {
  return ROLE_RANK[roleName] ?? 0;
}

export function isSuperAdmin(profile: Pick<EmpProfile, 'role_id'>, roleNameById: Map<string, RoleName>): boolean {
  return roleNameById.get(profile.role_id) === 'super_admin';
}

export function isAdmin(profile: Pick<EmpProfile, 'role_id'>, roleNameById: Map<string, RoleName>): boolean {
  const rank = getRoleRank(roleNameById.get(profile.role_id) ?? 'employee');
  return rank >= ROLE_RANK.admin;
}

export function isDomainHead(profile: Pick<EmpProfile, 'role_id'>, roleNameById: Map<string, RoleName>): boolean {
  const rank = getRoleRank(roleNameById.get(profile.role_id) ?? 'employee');
  return rank >= ROLE_RANK.domain_head;
}

// ─── Task permissions ─────────────────────────────────────────────────────────

/**
 * Can assign a task (set assignees, deadlines, priority).
 * Admin+ always; Domain Head within their own domain(s).
 */
export function canAssignTask(
  profile: Pick<EmpProfile, 'id' | 'role_id'>,
  taskDomainId: string,
  userDomains: Pick<EmpUserDomain, 'domain_id' | 'role_in_domain'>[],
  roleNameById: Map<string, RoleName>,
): boolean {
  if (isAdmin(profile, roleNameById)) return true;
  return userDomains.some(
    ud => ud.domain_id === taskDomainId && ud.role_in_domain === 'head'
  );
}

/**
 * Can move a task to `submitted_for_review`.
 * Only an assignee on the task.
 */
export function canSubmitForReview(
  profileId: string,
  assigneeIds: string[],
): boolean {
  return assigneeIds.includes(profileId);
}

/**
 * Can approve (move submitted_for_review → completed) or send back to in_progress.
 * Domain Head of that domain, Admin+.
 */
export function canVerifyTask(
  profile: Pick<EmpProfile, 'id' | 'role_id'>,
  taskDomainId: string,
  userDomains: Pick<EmpUserDomain, 'domain_id' | 'role_in_domain'>[],
  roleNameById: Map<string, RoleName>,
): boolean {
  if (isAdmin(profile, roleNameById)) return true;
  return userDomains.some(
    ud => ud.domain_id === taskDomainId && ud.role_in_domain === 'head'
  );
}

/**
 * Can see private notes on a task.
 * Only the author and anyone with admin+ role (senior in reporting chain).
 * Note: this is also enforced by RLS — this is purely for UI gating.
 */
export function canSeePrivateNote(
  profile: Pick<EmpProfile, 'id' | 'role_id'>,
  noteAuthorId: string | null,
  roleNameById: Map<string, RoleName>,
): boolean {
  if (!noteAuthorId) return false;
  if (profile.id === noteAuthorId) return true;
  return isAdmin(profile, roleNameById);
}

// ─── Profile / people permissions ────────────────────────────────────────────

/**
 * Can create a profile (invite a new user).
 * Admin+ only.
 */
export function canCreateProfile(
  profile: Pick<EmpProfile, 'role_id'>,
  roleNameById: Map<string, RoleName>,
): boolean {
  return isAdmin(profile, roleNameById);
}

/**
 * Admin can only create domain_head or employee roles (never super_admin or another admin).
 * Super Admin can create any role.
 */
export function canAssignRole(
  actor: Pick<EmpProfile, 'role_id'>,
  targetRoleName: RoleName,
  roleNameById: Map<string, RoleName>,
): boolean {
  const actorRole = roleNameById.get(actor.role_id) ?? 'employee';
  if (actorRole === 'super_admin') return true;
  if (actorRole === 'admin') return targetRoleName === 'domain_head' || targetRoleName === 'employee';
  return false;
}

// ─── Communication permissions ────────────────────────────────────────────────

/**
 * Can see a domain channel's thread.
 * Must be a member of that domain, or admin+ who owns it.
 */
export function canSeeThread(
  profile: Pick<EmpProfile, 'id' | 'role_id'>,
  channelDomainId: string | null,
  userDomains: Pick<EmpUserDomain, 'domain_id'>[],
  roleNameById: Map<string, RoleName>,
): boolean {
  if (isSuperAdmin(profile, roleNameById)) return true;
  if (!channelDomainId) return true; // DMs are always visible to participants
  return userDomains.some(ud => ud.domain_id === channelDomainId);
}

// ─── Admin page permissions ───────────────────────────────────────────────────

export function canAccessAdminPage(
  profile: Pick<EmpProfile, 'role_id'>,
  roleNameById: Map<string, RoleName>,
): boolean {
  return isAdmin(profile, roleNameById);
}

export function canEditDomainFieldTemplate(
  profile: Pick<EmpProfile, 'id' | 'role_id'>,
  domainId: string,
  userDomains: Pick<EmpUserDomain, 'domain_id' | 'role_in_domain'>[],
  roleNameById: Map<string, RoleName>,
): boolean {
  if (isAdmin(profile, roleNameById)) return true;
  return userDomains.some(
    ud => ud.domain_id === domainId && ud.role_in_domain === 'head'
  );
}
