// CONNECT SOCKET.IO TO BACKEND
const socket = io("https://smart-grain-analyzer.onrender.com");

// CAMERA ELEMENTS
let model;
let video = document.getElementById("video");
let latestImage = document.getElementById("latestImage");
let latestStatus = document.getElementById("latestStatus");

const labels = ["Good Rice", "Bad Rice", "Wet Rice"];

// ------------ START CAMERA ------------
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        console.error("Camera Error:", err);
        latestStatus.innerText = "Camera Error!";
    }
}
startCamera();

// ------------ LOAD MODEL ------------
async function loadModel() {
    try {
        latestStatus.innerText = "Model loading…";

        // FIXED PATH
        model = await tf.loadLayersModel("/model/model.json");

        latestStatus.innerText = "Model Loaded ✔";
        console.log("MODEL LOADED!");
    } catch (e) {
        console.error("Model Load Error:", e);
        latestStatus.innerText = "Model Load Failed!";
    }
}
loadModel();

// ------------ PREDICT FRAME ------------
async function predictFrame() {
    if (!model || video.videoWidth === 0) return;

   const tensor = tf.tidy(() => {
    return tf.browser.fromPixels(video)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(127.5)
        .sub(1)
        .expandDims(0);
});

    const prediction = model.predict(tensor);
    const data = await prediction.data();

    const index = data.indexOf(Math.max(...data));
    const confidence = (data[index] * 100).toFixed(1);

    const result = {
        label: labels[index],
        confidence: confidence
    };

    latestStatus.innerText = `${result.label} (${result.confidence}%)`;

    const base64 = captureImage();
    latestImage.src = base64;

    // Send real-time data to backend (socket.io)
    socket.emit("classification", {
        image: base64,
        result: result
    });
}

function captureImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 224, 224);

    return canvas.toDataURL("image/jpeg");
}

// Auto Predict every 10 sec
setInterval(predictFrame,10000);
