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

// Public files
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// ============================
// 📌 SOCKET.IO CONNECTION
// ============================
io.on("connection", socket => {
    console.log("📡 Client connected:", socket.id);

    // Receive classification from mobile (script.js)
    socket.on("classification", data => {
        console.log("📨 Classification received:", data.result);

        // Broadcast to dashboard
        io.emit("new-classification", {
            image: data.image,
            result: data.result
        });
    });
});

// ============================
// 📌 API ROUTE (Upload backup)
// ============================
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

// ============================
// 📌 MOISTURE ROUTE
// ============================
const moistureRoute = require("./routes/moistureRoute")(io);
app.use("/moisture", moistureRoute);

// ============================
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
