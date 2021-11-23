const Express = require("express");
const app = Express();

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/api/temperature", (req, res) => {
    const value = -5 + (30 - -5) * Math.random();
    res.json({ value });
});

app.listen(80, () => console.log("Backend started on Port 80"));