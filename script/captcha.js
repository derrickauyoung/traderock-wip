// captcha.js
const isLocalhost = location.hostname === "localhost";
const sitekey = isLocalhost
    ? "10000000-ffff-ffff-ffff-000000000001"  // hCaptcha test key
    : "e3f66718-0606-4dc0-ae0c-fd44270a8f62";

let pendingResolve = () => {};
let pendingReject = () => {};

export async function requestCaptchaToken() {
    const existingToken = sessionStorage.getItem('hcaptchaToken');
    if (existingToken) return existingToken;

    return new Promise((resolve, reject) => {
        const modal = createCaptchaModal(resolve, reject);
        document.body.appendChild(modal);
        renderCaptchaWidget();
    });
}

function createCaptchaModal(resolve, reject) {
    pendingResolve = resolve;
    pendingReject = reject;

    const modal = document.createElement('div');
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
        zIndex: 9999
    });

    const modalContent = document.createElement('div');
    modalContent.style.background = "white";
    modalContent.style.padding = "1.5rem";
    modalContent.style.borderRadius = "12px";
    modalContent.style.textAlign = "center";
    modalContent.style.width = "320px";
    modalContent.innerHTML = `
        <h2 style="margin-bottom: 1rem;">Please verify you're human</h2>
        <div id="captcha-container" style="margin-bottom: 1rem;"></div>
        <button id="cancel-captcha" style="color: #888; font-size: 0.9rem;">Cancel</button>
    `;

    modal.appendChild(modalContent);
    modalContent.querySelector("#cancel-captcha").onclick = () => {
        closeModal();
        reject("User cancelled CAPTCHA");
    };

    return modal;
}

function renderCaptchaWidget() {
  const interval = setInterval(() => {
      if (window.hcaptcha && typeof hcaptcha.render === "function") {
          clearInterval(interval);
          hcaptcha.render("captcha-container", {
              sitekey: sitekey,
              callback: async (token) => {
                  const isHuman = await verifyCaptcha(token);
                  if (isHuman) {
                      sessionStorage.setItem('hcaptchaToken', token);
                      closeModal();
                      pendingResolve(token);
                  } else {
                      alert("❌ CAPTCHA failed. Please try again.");
                      hcaptcha.reset();
                  }
              }
          });
      } else {
          console.log("Waiting for hCaptcha to load...");
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
  const isLocalhost = location.hostname === "localhost";
  const functionUrl = isLocalhost
      ? "http://localhost:8888/.netlify/functions/verify-captcha"
      : "/.netlify/functions/verify-captcha";

  const response = await fetch(functionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
  });

  const result = await response.json();
  return result.success === true;
}