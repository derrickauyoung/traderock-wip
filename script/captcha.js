const isLocalhost = location.hostname === "localhost";
const sitekey = isLocalhost
  ? "10000000-ffff-ffff-ffff-000000000001"
  : "e3f66718-0606-4dc0-ae0c-fd44270a8f62";

let pendingResolve = () => {};
let pendingReject = () => {};

export async function requestCaptchaToken() {
  const existingToken = sessionStorage.getItem("hcaptchaToken");
  if (existingToken) return existingToken;

  return new Promise((resolve, reject) => {
    console.log("🔐 Creating hCaptcha modal...");
    const modal = createCaptchaModal(resolve, reject);
    document.body.appendChild(modal);
    console.log("📦 Modal structure created.");
    renderCaptchaWidget();
  });
}

function createCaptchaModal(resolve, reject) {
  pendingResolve = resolve;
  pendingReject = reject;

  const modal = document.createElement("div");
  modal.id = "captcha-modal";
  Object.assign(modal.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  });

  const modalContent = document.createElement("div");
  Object.assign(modalContent.style, {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    textAlign: "center",
    width: "320px",
  });

  const heading = document.createElement("h2");
  heading.textContent = "Please verify you're human";
  heading.style.marginBottom = "1rem";

  const container = document.createElement("div");
  container.id = "captcha-container";
  container.style.marginBottom = "1rem";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  Object.assign(cancelButton.style, {
    color: "#888",
    fontSize: "0.9rem",
  });
  cancelButton.onclick = () => {
    closeModal();
    reject("User cancelled CAPTCHA");
  };

  modalContent.appendChild(heading);
  modalContent.appendChild(container);
  modalContent.appendChild(cancelButton);
  modal.appendChild(modalContent);

  return modal;
}

function renderCaptchaWidget() {
  console.log("🎯 Calling renderCaptchaWidget...");
  let waitTime = 0;
  const interval = setInterval(() => {
    const container = document.getElementById("captcha-container");

    if (!container) {
      console.warn("⚠️ Missing #captcha-container. Waiting...");
      waitTime += 100;
      if (waitTime > 5000) {
        clearInterval(interval);
        console.error("❌ #captcha-container did not appear in time.");
      }
      return;
    }

    if (window.hcaptcha && typeof hcaptcha.render === "function") {
      console.log("✅ hCaptcha loaded. Rendering widget...");
      clearInterval(interval);
      hcaptcha.render("captcha-container", {
        sitekey,
        callback: async (token) => {
          const isHuman = await verifyCaptcha(token);
          if (isHuman) {
            sessionStorage.setItem("hcaptchaToken", token);
            closeModal();
            pendingResolve(token);
          } else {
            alert("❌ CAPTCHA failed. Please try again.");
            hcaptcha.reset();
          }
        },
      });
    } else {
      waitTime += 100;
      if (waitTime > 5000) {
        clearInterval(interval);
        console.error("❌ hCaptcha failed to load within 5 seconds.");
      } else {
        console.log("⏳ Waiting for hCaptcha to load...");
      }
    }
  }, 100);
}

function closeModal() {
  const modal = document.getElementById("captcha-modal");
  if (modal) {
    modal.remove();
  }
}

async function verifyCaptcha(token) {
  const functionUrl = isLocalhost
    ? "http://localhost:54321/functions/v1/verify-captcha"
    : "https://napmuiqctvbegldujfbb.supabase.co/functions/v1/verify-captcha";

  const res = await fetch(functionUrl, {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await res.json();
  console.log("📬 Captcha verification result:", result);

  if (!res.ok) {
    throw new Error(`Captcha failed: ${JSON.stringify(result)}`);
  }

  return result.success;
}