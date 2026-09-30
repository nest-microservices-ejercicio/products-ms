import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {

  const logger = new Logger('Main')

  //! -- 🚫 Sin microservicio
  // const app = await NestFactory.create(AppModule);

  //! -- Microservicio con TCP
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.TCP,
  //     options: {
  //       port: envs.port
  //     }
  //   }
  // );

  //? -- Microservicio con NATS
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers
      }
    }
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // NestJS elimina campos que no están en el DTO
      forbidNonWhitelisted: true, // Retorna un error si viene un campo que no está en el DTO
    })
  )

  //! -- 🚫 Sin microservicio
  //await app.listen(envs.port);

  //? -- ✅ Con microservicio
  await app.listen();

  logger.log(`Products Microservice running on port ${envs.port}`)

}
bootstrap();
