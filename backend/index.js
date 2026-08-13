import express from "express";
import dotenv from "dotenv";
const app = express();
dotenv.config({
    "path": "./.env"
})


app.use(express.json());

app.get("/",(req,res)=>{
    res.send("backend up and running");
})

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server Running on PORT ${PORT}`)
})