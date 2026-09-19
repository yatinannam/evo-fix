/**
 * Base path the EvoCare patient app is mounted at within the combined site.
 * Routes live under src/app/evocare/(app)/* → URLs like /evocare/login.
 * withBasePath() prefixes internal navigation so links resolve correctly.
 */
export const BASE_PATH = "/evocare";

export function withBasePath(path) {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
