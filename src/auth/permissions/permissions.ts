export enum PermissionCategories {
  Member = 'Member',
  Group = 'Group',
}

export enum Permissions {
  // Member perms
  ViewMember = 'member:view',
  CreateMember = 'member:create',
  UpdateMember = 'member:create',
  ViewMemberEmail = 'member:viewEmail',
  UpdateMemberEmail = 'member:updateEmail',

  // Group perms
  ViewGroups = 'groups:viewGroups',
  CreateGroups = 'groups:createGroups',
  UpdateGroups = 'groups:updateGroups',
  DeleteGroups = 'groups:deleteGroups',
}

export type PermissionDetail = {
  code: string;
  category: string;
  name: string;
  description: string;
};

export const permissionDetails: PermissionDetail[] = [
  {
    code: Permissions.ViewMember,
    category: PermissionCategories.Member,
    name: 'View Member Profiles',
    description: 'View the profile of any Member (exludes email)',
  },
  {
    code: Permissions.CreateMember,
    category: PermissionCategories.Member,
    name: 'Create Member Profiles',
    description: 'Create a member profile',
  },
  {
    code: Permissions.UpdateMember,
    category: PermissionCategories.Member,
    name: 'Update Member Profiles',
    description: 'Update a member profile (exludes email)',
  },
  {
    code: Permissions.ViewMemberEmail,
    category: PermissionCategories.Member,
    name: 'View Member Email',
    description: "View member's email",
  },
  {
    code: Permissions.UpdateMemberEmail,
    category: PermissionCategories.Member,
    name: 'Update Member Email',
    description: "Update a member's email",
  },
  {
    code: Permissions.ViewGroups,
    category: PermissionCategories.Group,
    name: 'View Groups',
    description: 'View all user groups',
  },
  {
    code: Permissions.CreateGroups,
    category: PermissionCategories.Group,
    name: 'Create Groups',
    description: 'Create a new user group',
  },
  {
    code: Permissions.UpdateGroups,
    category: PermissionCategories.Group,
    name: 'Edit Groups',
    description: 'Edit an existing user group',
  },
  {
    code: Permissions.DeleteGroups,
    category: PermissionCategories.Group,
    name: 'Delete Groups',
    description: 'Delete an existing user group',
  },
];
