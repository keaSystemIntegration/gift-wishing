import express from "express"

const PORT =process.env.PORT ?? 80

const app = express()

app.get("/*", (req,res)=> {
    console.log("this is a call for me :D")
    console.log(process.env.PORT)
    res.send({message: `simple app on port: ${PORT}`})
})

app.listen(PORT ,()=> console.log("services is running on port: ", PORT))
