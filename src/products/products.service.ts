import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  onModuleInit() {
    this.$connect();
    console.log('Base de datos Conectada')
  }

  //?--------------
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  //?--------------
  async findAll(pagintionDto: PaginationDto) {

    const { page, limit } = pagintionDto;

    //- Total de paginas
    const totalProducts = await this.product.count({where: {available: true}});
    //- Total de paginas
    const totalPages = Math.ceil(totalProducts / limit!)

    //- Productos paginados
    const products = await this.product.findMany({
      skip: (page! - 1) * limit!, // Restamos 1 para que empiece desde el cero 
      take: limit,
      where: {
        available: true
      }
    })

    return {
      data: products,
      meta: {
        totalProducts,
        page,
        totalPages
      }
    }
  }

  //?--------------
  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {id}
    })

    if(!product) {
      throw new NotFoundException(`Product with id ${id} not found`)
    }

    return product
  }

  //?--------------
  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id:__, ...data} = updateProductDto    

    await this.findOne(id);

    return this.product.update({
      where: {id},
      data: data
    })
  }

  //?--------------
  async remove(id: number) {
    await this.findOne(id)

    //- soft delete
    const product = await this.product.update({
      where: {id},
      data: {
        available: false
      }
    })

    // return this.product.delete({
    //   where: {id}
    // })
  }
}
