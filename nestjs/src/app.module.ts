import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './controllers/home.controller';
import { HomeService } from './services/home.service';
import { Skill } from './entities/skill.entity';
import { Project } from './entities/project.entity';
import { ProjectCategory } from './entities/project-category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [Skill, Project, ProjectCategory],
        synchronize: false,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Skill, Project, ProjectCategory]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class AppModule {}
