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
  };


export default async function logToServer(...args) {
  // Join the arguments with a separator and convert them into a string
  const msg = args.join(' - ');

  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: msg })
    });
  } catch (e) {
    console.error("Error logging to server:", e);
  }
}
