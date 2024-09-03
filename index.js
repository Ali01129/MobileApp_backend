const express = require('express');
const app = express();
const client = require("./database");
const authRoutes = require("./routes/auth");

app.use(express.json());

//routes
app.use("/auth", authRoutes);

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});