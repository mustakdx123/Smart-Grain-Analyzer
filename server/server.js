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

app.use(express.json());

// Serve PUBLIC folder
app.use(express.static(path.join(__dirname, "../public")));

// DEFAULT HOME ROUTE (Fix for Render)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Upload
const upload = multer({ dest: "uploads/" });

// SOCKET.IO
io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    socket.on("classification", data => {
        io.emit("new-classification", data);
    });
});

// Backup upload (not needed but kept)
app.post("/upload", upload.single("riceImage"), (req, res) => {
    const imgPath = req.file.path;
    const base64 = fs.readFileSync(imgPath, { encoding: "base64" });

    io.emit("new-classification", {
        image: `data:image/jpeg;base64,${base64}`,
        result: {
            label: req.body.label,
            confidence: req.body.confidence
        }
    });

    res.json({ ok: true });
});

// Moisture
const moistureRoute = require("./routes/moistureRoute")(io);
app.use("/moisture", moistureRoute);

// RUN SERVER
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
