export const AUTH_CONSTANTS = {
  // GitHub Pages URL for email confirmations
  GITHUB_PAGES_URL: "https://trongchuonghcmus.github.io/educare-auth-pages/",

  // Deep link scheme for the app
  APP_SCHEME: "educareconnect://",

  // Redirect URLs for different auth actions
  REDIRECT_URLS: {
    confirmed: "educareconnect://auth/confirmed",
    "reset-password": "educareconnect://auth/reset-password",
    "email-changed": "educareconnect://auth/email-changed",
    "invite-accepted": "educareconnect://auth/invite-accepted",
  },
} as const;
