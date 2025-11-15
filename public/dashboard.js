<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Smart Grain Dashboard</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>
  <div class="container">

    <h1>Smart Grain Quality Dashboard</h1>

    <div class="grid-layout">

      <!-- LEFT SIDE -->
      <div class="left-panel">

        <div class="card big-image">
          <h2>Live Latest Capture</h2>
          <img id="liveImage" src="" style="width:100%; border-radius:10px;">
        </div>

        <div class="card">
          <h3>AI Prediction</h3>
          <div id="aiResult" class="reading">Waiting...</div>
        </div>

        <div class="card">
          <h3>Moisture Level</h3>
          <div id="moistureReading" class="reading">-- %</div>
        </div>

      </div>

      <!-- RIGHT SIDE -->
      <div class="right-panel">

        <div class="card">
          <h3>Moisture Graph</h3>
          <canvas id="moistureChart"></canvas>
        </div>

        <div class="card">
          <h3>Prediction History</h3>
          <ul id="predictionHistory"></ul>
        </div>

        <div class="card">
          <h3>Quality Distribution</h3>
          <canvas id="pieChart"></canvas>
        </div>

      </div>
    </div>

  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script src="dashboard.js"></script>
</body>
</html>
