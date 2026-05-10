const express = require("express");
const cors = require("cors");
const app = express();

//middleware

app.use(cors());
app.use(express.json());

//routes
app.use("/auth", require("./routes/auth"));
app.use("/tasks", require("./routes/tasks"));

//health check

app.get("/", (req,res) =>{

    res.json({message: "Taskflow API is running"});
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () =>{

    console.log(`Server running on http://localhost:${PORT}`);
});