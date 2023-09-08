/**
 * Interface defining the component's options object
 */
// sonarignore:start
export interface UserServiceComponentOptions {
  //NOSONAR
  controllers?: string[];
}

// sonarignore:end

/**
 * Default options for the component
 */
export const DEFAULT_USER_TENANT_SERVICE_OPTIONS: UserServiceComponentOptions = {
  // Specify the values here
};
