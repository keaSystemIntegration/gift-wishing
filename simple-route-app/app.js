import express from "express"

const PORT =process.env.PORT ?? 8080

const app = express()

app.get("/*", (req,res)=> {
    res.send({message: `simple app on port: ${PORT}`})
})

app.listen(PORT ,()=> console.log("services is running on port: ", PORT))
