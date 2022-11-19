import "reflect-metadata";
import {buildSchema} from "type-graphql";
import {ProductResolver} from "../graphql/products/product";

export const graphQLSchema = buildSchema({
    resolvers: [ProductResolver],
    emitSchemaFile: true
})