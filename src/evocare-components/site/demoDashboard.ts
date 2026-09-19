/** The public EvoCare landing page opens the real account flow. */
export const EVOCARE_SIGNUP_PATH = "/evocare/signup";

export function openDemoDashboard() {
  window.location.assign(EVOCARE_SIGNUP_PATH);
}
