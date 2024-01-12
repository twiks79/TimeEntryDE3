export const defaultSession = {
    username: "",
    isLoggedIn: false,
  };
  
  export const sessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieName: "timeentry",
    cookieOptions: {
      secure: true, // Note: secure should be set to `process.env.NODE_ENV === "production"` if you want it to work in non-HTTPS environments like localhost
    },
  };
  
  export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }