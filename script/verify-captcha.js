export async function verifyCaptcha(token) {
    const res = await fetch("https://napmuiqctvbegldujfbb.supabase.co/functions/v1/verify-captcha", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        "Content-Type": "application/json",
      }
    });
  
    const result = await res.json();
    return result.success;
  }