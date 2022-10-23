import {Arg, Query, Resolver} from "type-graphql";
import productsData from "../../products.json"
import {Product} from "./product-resolver";


@Resolver()
export class ProductResolver {
    private products: Product[] = productsData.products

    @Query(()=> [Product])
    async getProducts(): Promise<Product[]>{
        return this.products
    }
    @Query(()=>Product)
    async  getProduct(@Arg("id") id: string): Promise<Product> {
        const product = this.products.find(product => product.id === id)
        if (product)
            return product
        throw new Error("product not found")
    }

}