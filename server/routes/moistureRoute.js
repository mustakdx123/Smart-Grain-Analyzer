const express = require('express');

module.exports = io => {
  const router = express.Router();

  router.post("/", (req, res) => {
    const { moisture } = req.body;

    io.emit("moisture-update", {
      moisture,
      time: new Date().toLocaleTimeString()
    });

    res.json({ success: true });
  });

  return router;
};
