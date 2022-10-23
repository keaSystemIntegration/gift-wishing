import {Field, ObjectType} from "type-graphql";

@ObjectType()
export class Product {
    @Field()
    id!: string

    @Field()
    productName!: string

    @Field()
    productSubTitle!: string

    @Field()
    productDescription!: string

    @Field()
    category!: string

    @Field()
    subCategory!: string

    @Field()
    price!: number

    @Field()
    link!: string

    @Field()
    overallRanking!: number
}