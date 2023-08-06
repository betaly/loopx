/**
 * Interface defining the component's options object
 */
// sonarignore:start
export interface UserTenantServiceComponentOptions {
  //NOSONAR
  services?: string[];
  controllers?: string[];
}

// sonarignore:end

/**
 * Default options for the component
 */
export const DEFAULT_USER_TENANT_SERVICE_OPTIONS: UserTenantServiceComponentOptions = {
  // Specify the values here
};
