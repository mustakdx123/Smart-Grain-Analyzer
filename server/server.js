const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve PUBLIC folder
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// HOME ROUTE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Upload
const upload = multer({ dest: "uploads/" });

// SOCKET.IO
io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    socket.on("classification", data => {
        console.log("Forwarding classification to dashboards...");
        io.emit("new-classification", data);
    });
});

// Backup upload
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

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
