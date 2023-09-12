import {DefaultActions} from 'loopback4-acl';

enum TenantCustomActions {
  update_batch = 'update_batch',
  transfer = 'transfer',
}
export type TenantActions = DefaultActions | TenantCustomActions;
export const TenantActions = {
  ...DefaultActions,
  ...TenantCustomActions,
};
