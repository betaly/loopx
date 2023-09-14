import {DefaultActions} from 'loopback4-acl';

enum TenantCustomActions {
  transfer = 'transfer',
}
export type TenantActions = DefaultActions | TenantCustomActions;
export const TenantActions = {
  ...DefaultActions,
  ...TenantCustomActions,
};
