// CONNECT SOCKET.IO TO RENDER BACKEND
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

// Pie Chart
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

// SOCKET LISTENERS =====================

// Prediction & Image
socket.on("new-classification", data => {
  imgBox.src = data.image;
  aiResult.innerText = `${data.result.label} (${data.result.confidence}%)`;

  let key = data.result.label.split(" ")[0];
  if (count[key] !== undefined) count[key]++;

  pie.data.datasets[0].data = [count.Good, count.Bad, count.Wet];
  pie.update();

  const li = document.createElement("li");
  li.innerText = `${data.result.label} - ${data.result.confidence}%`;
  historyList.prepend(li);
});

// Moisture
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
