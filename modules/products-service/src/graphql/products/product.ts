import { Arg, Directive, Query, Resolver } from 'type-graphql'

import { Product } from '../../schema/resolvers/product-resolver'
import { PrismaClient } from '../../../prisma/client'
import { CacheHint } from '@apollo/cache-control-types/src'

const prisma = new PrismaClient()

@Resolver()
export class ProductResolver {
    @Query(() => [Product])
    async Products(
        @Arg('searchParam', { nullable: true }) searchParam: string,
        @Arg('pageSize', { nullable: true }) pageSize: number,
        @Arg('pageNumber', { nullable: true }) pageNumber: number
    ) {
        const page = pageNumber ?? undefined
        const limit = pageSize ?? undefined
        const search = searchParam
            ? {
                  name: { contains: searchParam },
              }
            : {}
        console.log(page ?? (pageNumber ?? 0) * (pageSize ?? 0))

        return prisma.products.findMany({
            where: search,
            skip: page ?? (pageNumber ?? 0) * (pageSize ?? 0),
            take: limit,
        })
    }

    @Query(() => Product)
    @CacheControl({ maxAge: 60, scope: 'PUBLIC' })
    async Product(@Arg('id') id: string) {
        const product = await prisma.products.findUnique({ where: { id } })
        if (product) return product
        else throw new Error('product not found')
    }
}

export function CacheControl({ maxAge, scope = 'PUBLIC' }: CacheHint) {
    if (!maxAge && !scope) {
        throw new Error('Missing maxAge or scope param for @CacheControl')
    }

    let sdl = '@cacheControl('
    if (maxAge) {
        sdl += `maxAge: ${maxAge}`
    }
    if (scope) {
        sdl += ` scope: ${scope}`
    }
    sdl += ')'

    return Directive(sdl)
}
