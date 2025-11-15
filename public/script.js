const video = document.getElementById("video");
const statusBox = document.getElementById("latestStatus");
const latestImage = document.getElementById("latestImage");

let model;

// Load model (Frontend)
(async () => {
    model = await tf.loadLayersModel("/model/model.json");
    statusBox.innerText = "Model Loaded. Starting...";
    console.log("Frontend Model Loaded");
})();

// Start Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        video.srcObject = stream;

        video.onloadedmetadata = () => video.play();
    } catch (err) {
        console.error("Camera Error:", err);
        statusBox.innerText = "Camera Error!";
    }
}

startCamera();

// Capture Frame & Make Tensor
function captureFrame() {
    if (video.videoWidth === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 224, 224);

    // Show latest frame
    latestImage.src = canvas.toDataURL("image/jpeg");

    return canvas;
}

// Predict from frontend model
async function predictFrontend(canvas) {
    const imgData = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims(0);

    const pred = model.predict(imgData);
    const scores = await pred.data();

    const labels = ["Good Rice", "Bad Rice", "Wet Rice"];
    const maxIdx = scores.indexOf(Math.max(...scores));

    return {
        label: labels[maxIdx],
        confidence: (scores[maxIdx] * 100).toFixed(2)
    };
}

async function processFrame() {
    if (!model) return;

    const canvas = captureFrame();
    if (!canvas) return;

    // FRONTEND PREDICTION
    const result = await predictFrontend(canvas);

    statusBox.innerText = `AI: ${result.label} (${result.confidence}%)`;

    // Convert to Blob for backend
    const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg"));

    const fd = new FormData();
    fd.append("riceImage", blob);
    fd.append("label", result.label);
    fd.append("confidence", result.confidence);

    // SEND TO BACKEND for dashboard
    await fetch("/upload", {
        method: "POST",
        body: fd
    });
}

// Run every 10 seconds
setInterval(processFrame, 10000);
