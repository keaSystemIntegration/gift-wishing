import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class Product {
    @Field()
    id!: string

    @Field()
    name!: string

    @Field()
    subTitle!: string

    @Field()
    description!: string

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
