import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, getAuth } from '@clerk/express'

const app = express()
app.use(cors())
app.use(express())
app.use(clerkMiddleware())

app.get("/", (req, res)=>{
    res.send("Server is Live !")
})
app.use(getAuth())

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log("Server is running on port: ",PORT)
})