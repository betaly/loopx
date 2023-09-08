export interface UserCoreComponentOptions {
  /**
   * @description
   * The prefix to be used to create a username for a user.
   * @default 'user_'
   */
  defaultUsernamePrefix?: string;

  /**
   * @description
   * These credentials will be used to create the Superadmin user when system bootstraps.
   *
   * @default
   * {
   *  identifier: 'superadmin',
   *  password: 'superadmin',
   * }
   */
  superadminCredentials?: SuperadminCredentials;
}

/**
 * @description
 * These credentials will be used to create the Superadmin user when system bootstraps.
 *
 * @docsCategory auth
 */
export interface SuperadminCredentials {
  /**
   * @description
   * The identifier to be used to create a superadmin account
   * @default 'superadmin'
   */
  identifier: string;

  /**
   * @description
   * The password to be used to create a superadmin account
   * @default 'superadmin'
   */
  password: string;
}
