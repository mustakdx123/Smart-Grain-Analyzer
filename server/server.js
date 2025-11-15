const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server);

// Public
app.use(express.static(path.join(__dirname, "../public")));

const upload = multer({ dest: "uploads/" });

// Receives image + prediction
app.post("/upload", upload.single("riceImage"), (req, res) => {
    const imgPath = req.file.path;

    const base64 = fs.readFileSync(imgPath, { encoding: "base64" });
    const imageURL = `data:image/jpeg;base64,${base64}`;

    const label = req.body.label;
    const confidence = req.body.confidence;

    io.emit("new-classification", {
        image: imageURL,
        result: { label, confidence }
    });

    res.json({ ok: true });
});

// Moisture
const moistureRoute = require("./routes/moistureRoute")(io);
app.use("/moisture", moistureRoute);

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
