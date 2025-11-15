const video = document.getElementById('video');
const statusBox = document.getElementById('latestStatus');

let model;

// Load model
(async () => {
  model = await tf.loadLayersModel('/model/model.json');
  statusBox.innerText = "Model Loaded!";
})();

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;
}

startCamera();

// Convert frame to Tensor
function captureTensor() {
  const c = document.createElement('canvas');
  c.width = video.videoWidth;
  c.height = video.videoHeight;
  c.getContext('2d').drawImage(video, 0, 0);

  return c;
}

async function processFrame() {
  if (!model) return;

  const canvas = captureTensor();
  const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg'));

  // SEND TO BACKEND
  const fd = new FormData();
  fd.append("riceImage", blob);

  const req = await fetch("/upload", { method: "POST", body: fd });
  const resp = await req.json();

  statusBox.innerText = `AI: ${resp.label} (${resp.confidence}%)`;
}

setInterval(processFrame, 10000);
