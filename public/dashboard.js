// CONNECT SOCKET.IO
const socket = io("https://smart-grain-analyzer.onrender.com");

// Elements
const imgBox = document.getElementById("liveImage");
const aiResult = document.getElementById("aiResult");
const moistText = document.getElementById("moistureReading");
const historyList = document.getElementById("predictionHistory");

// Moisture Graph
let moistureLabels = [];
let moistureValues = [];

const ctx = document.getElementById("moistureChart").getContext("2d");

const moistureChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: moistureLabels,
        datasets: [{
            label: "Moisture",
            data: moistureValues,
            borderColor: "#4ea1ff",
            backgroundColor: "rgba(78,161,255,0.2)",
            fill: true
        }]
    }
});

// Pie chart data
let count = { Good: 0, Bad: 0, Wet: 0 };

const pie = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
        labels: ["Good", "Bad", "Wet"],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ["#27ae60", "#c0392b", "#f1c40f"]
        }]
    }
});


// 🔥 LISTEN FOR NEW CLASSIFICATION
socket.on("new-classification", data => {

    // Show live image
    imgBox.src = data.image;

    // Show result
    aiResult.innerText = `${data.result.label} (${data.result.confidence}%)`;

    // Update Pie Chart
    const key = data.result.label.split(" ")[0];
    if (count[key] !== undefined) count[key]++;

    pie.data.datasets[0].data = [count.Good, count.Bad, count.Wet];
    pie.update();

    // Update History log
    const li = document.createElement("li");
    li.innerText = `${data.result.label} - ${data.result.confidence}%`;
    historyList.prepend(li);
});


// 🔥 LISTEN FOR MOISTURE DATA
socket.on("moisture-update", data => {

    moistText.innerText = `${data.moisture}%`;

    moistureLabels.push(data.time);
    moistureValues.push(data.moisture);

    if (moistureLabels.length > 40) {
        moistureLabels.shift();
        moistureValues.shift();
    }

    moistureChart.update();
});
