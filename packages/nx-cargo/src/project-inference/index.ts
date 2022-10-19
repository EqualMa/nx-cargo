export const projectFilePatterns = ['Cargo.toml'];

/**
 * Currently, this plugin only infers the project
 * but doesn't register targets.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerProjectTargets(projectFilePath: string) {
  return {};
}
