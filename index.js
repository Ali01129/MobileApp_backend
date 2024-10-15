const express = require('express');
const app = express();
const client = require("./database");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const userRoutes=require("./routes/user");
const adminRoutes=require("./routes/admin");
app.use(express.json());

//routes
app.use("/auth", authRoutes);
app.use("/project", projectRoutes);
app.use("/user",userRoutes);
app.use("/admin",adminRoutes);

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});