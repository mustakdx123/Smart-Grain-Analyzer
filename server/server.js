const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('riceImage'), async (req, res) => {

  const imgPath = req.file.path;

  // Send image to dashboard in Base64
  const base64 = fs.readFileSync(imgPath, { encoding: "base64" });
  const url = `data:image/jpeg;base64,${base64}`;

  // DUMMY LABEL FOR NOW (Frontend AI is final)
  const result = {
    label: "Processing",
    confidence: 0
  };

  io.emit("new-classification", { image: url, result });

  res.json(result);
});

// Moisture Route
const moistureRoute = require('./routes/moistureRoute')(io);
app.use('/moisture', moistureRoute);

server.listen(3000, () => console.log("Server running on 3000"));
