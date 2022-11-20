import { Arg, Query, Resolver } from 'type-graphql'

import { Product } from '../../schema/resolvers/product-resolver'
import { PrismaClient } from '../../../prisma/client'

const prisma = new PrismaClient()

@Resolver()
export class ProductResolver {
    @Query(() => [Product])
    async getProducts() {
        return prisma.products.findMany()
    }
    @Query(() => Product)
    async getProduct(@Arg('id') id: string) {
        const product = await prisma.products.findUnique({ where: { id } })
        if (product) return product
        else throw new Error('product not found')
    }
}
