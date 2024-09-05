const express = require('express');
const app = express();
const client = require("./database");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");

app.use(express.json());

//routes
app.use("/auth", authRoutes);
app.use("/project", projectRoutes);

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});