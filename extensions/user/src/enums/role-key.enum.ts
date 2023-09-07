import {titleize} from 'inflection';

export enum RoleKey {
  SuperAdmin = 'super_admin',
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
  ProgramManager = 'program_manager',
  GuestBoardViewer = 'guest_board_viewer',
  GuestDashboardViewer = 'guest_dashboard_viewer',
  Automation = 'automation',
  GuestTaskViewer = 'guest_task_viewer',
  GuestGroupViewer = 'guest_group_viewer',
  GuestWorkspaceViewer = 'guest_workspace_viewer',
}

export interface RoleKeyMapValue {
  name: string;
  key: string;
}

export type RoleKeyMap = {
  [key in string]: RoleKeyMapValue;
};

export const RoleKeyMap: RoleKeyMap = buildRoleKeyMap(RoleKey);

export function buildRoleKeyMap(roleKeys: Record<string, string>): RoleKeyMap {
  const roleKeyMap: RoleKeyMap = {};
  for (const name of Object.keys(roleKeys)) {
    roleKeyMap[roleKeys[name]] = {
      name: titleize(name),
      key: roleKeys[name],
    };
  }
  return roleKeyMap;
}
