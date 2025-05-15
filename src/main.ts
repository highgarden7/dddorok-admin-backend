import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CommonResponseInterceptor } from './common/interceptor/common-response.interceptor';
import { GlobalExceptionsFilter } from './common/exception/global.exception.filter';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { SnakeToCamelPipe } from './common/pipe/snake-to-camel.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);

  /**
   * 글로벌 파이프 설정
   * - DTO 유효성 검사 자동 수행
   */
  app.useGlobalPipes(
    new SnakeToCamelPipe(),
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  /**
   * 전역 인터셉터 등록: 모든 응답을 원하는 형식으로 래핑
   * response: {
   *   code: 200,
   *   message: 'ok',
   *   data: { ... }
   * }
   */
  app.useGlobalInterceptors(new CommonResponseInterceptor(reflector));

  // JWT 인증 가드 설정
  // - 모든 라우트에 대해 JWT 인증을 적용
  // - @Public() 데코레이터가 붙은 라우트는 인증을 생략
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // 전역 예외 필터 등록
  app.useGlobalFilters(new GlobalExceptionsFilter());

  /**
   * CORS 설정
   */
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'https://dev-api.dddorok.com',
      'https://dev.dddorok.com',
      'https://dev-admin.dddorok.com',
      'https://dev-admin-api.dddorok.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  /**
   * 글로벌 API prefix 설정
   * - 모든 라우트는 /api/* 로 시작
   */
  app.setGlobalPrefix('api');

  /**
   * Swagger 설정
   * - /swagger 경로에서 문서 확인 가능
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('dddorok admin API')
    .setDescription('뜨도록 ADMIN API 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDocument);

  /**
   * 서버 실행
   * - local은 127.0.0.1, dev/prod는 외부 접속 허용
   */
  const PORT = 3001;
  const HOST = process.env.NODE_ENV === 'local' ? '127.0.0.1' : '0.0.0.0';

  console.log(`Starting server in ${process.env.NODE_ENV} mode`);
  console.log(`Swagger URL: http://${HOST}:${PORT}/swagger`);
  await app.listen(PORT, HOST);
}
bootstrap();
