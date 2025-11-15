// CONNECT SOCKET.IO TO RENDER BACKEND
const socket = io("https://smart-grain-analyzer.onrender.com");

// Elements
const video = document.getElementById("video");
const statusBox = document.getElementById("latestStatus");
const latestImage = document.getElementById("latestImage");

// Load Frontend Model
let model;

(async () => {
    model = await tf.loadLayersModel("/model/model.json");
    statusBox.innerText = "Model Loaded";
    console.log("Frontend AI Model Loaded");
})();

// Start Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Camera Error:", err);
        statusBox.innerText = "Camera Error!";
    }
}

startCamera();

// Capture Frame
function captureFrame() {
    if (video.videoWidth === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 224, 224);

    latestImage.src = canvas.toDataURL("image/jpeg");

    return canvas;
}

// Predict Using Frontend AI
async function predictFrontend(canvas) {
    const tensor = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims(0);

    const output = model.predict(tensor);
    const scores = await output.data();

    const labels = ["Good Rice", "Bad Rice", "Wet Rice"];
    const bestIndex = scores.indexOf(Math.max(...scores));

    return {
        label: labels[bestIndex],
        confidence: (scores[bestIndex] * 100).toFixed(2)
    };
}

// Process Frame Every 10 Seconds
async function processFrame() {
    if (!model) return;

    const canvas = captureFrame();
    if (!canvas) return;

    const result = await predictFrontend(canvas);

    statusBox.innerText = `AI: ${result.label} (${result.confidence}%)`;

    // Send to backend for dashboard
    const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg"));
    const fd = new FormData();
    fd.append("riceImage", blob);
    fd.append("label", result.label);
    fd.append("confidence", result.confidence);

    await fetch("https://smart-grain-analyzer.onrender.com/upload", {
        method: "POST",
        body: fd
    });
}

setInterval(processFrame, 10000);
