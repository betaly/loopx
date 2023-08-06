import {matchResources} from './utils';

export function extractPermissions(
  permissionKeys: Record<string, string> | Record<string, string>[],
  patterns?: string[],
): string[] {
  permissionKeys = Array.isArray(permissionKeys) ? permissionKeys : [permissionKeys];
  return permissionKeys
    .map(keys =>
      matchResources(
        Object.values(keys).filter(p => !/^\d/.test(p[0])),
        patterns,
      ),
    )
    .flat();
}
