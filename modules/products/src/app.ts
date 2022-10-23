import express from "express"
import dotenv from "dotenv"
import {graphQLSchema} from "./schema/graphQLSchema";
import {graphqlHTTP} from "express-graphql";

dotenv.config()
const PORT = process.env.PORT
async function main()  {
const app = express()

app.use("/graphql", graphqlHTTP({schema: await graphQLSchema, graphiql: true}))

app.listen(PORT, () => console.log("Server is running on: ", PORT))
}
main()