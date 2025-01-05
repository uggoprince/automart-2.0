import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { NotFoundFilter } from './filters/notfound.filter';
import { ValidationException } from './exceptions/validation.exception';
import { ValidationFilter } from './filters/validation.filter';
import { BadRequestFilter } from './filters/badrequest.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('api/v2');
  app.useGlobalFilters(new ValidationFilter(), new NotFoundFilter(), new BadRequestFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages: any = {};
        errors.map((error) => {
          messages[error.property] = Object.values(error.constraints);
        });
        return new ValidationException(messages);
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('AutoMart 2.0')
    .setDescription('The AutoMart API description')
    .setVersion('2.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
