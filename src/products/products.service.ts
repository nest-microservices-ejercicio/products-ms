import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

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

  //? --------------
  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {id}
    })

    if(!product) {
      //- Retorna error en microservicio
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return product
  }

  //? --------------
  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id:__, ...data} = updateProductDto    

    await this.findOne(id);

    return this.product.update({
      where: {id},
      data: data
    })
  }

  //? --------------
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



  //? ---------- Validamos que los productos existan en la DB
  async validateProduct(ids: number[]) {

    //- Si vienen ids duplicados por que podemos mandar el mismo producto por diferente talle o color, pero el id del producto es el mismo
    //- set lo que hace es borrar ids duplicados
    ids = Array.from(new Set(ids))

    //- verificamos que existan los productos con el arreglo de ids
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    //- Si no tenemos la misma cantidad de productos de la DB que los ids que le mandamos
    //  significa que no encontro alguno
    if(products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST
      });
    }

    return products;

  }
}
