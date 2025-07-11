import { Controller, Get } from '@nestjs/common';
import { HomeService } from '../services/home.service';
import { HomeResponseDto } from '../dto/home.dto';

@Controller('api')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('home')
  async getHome(): Promise<HomeResponseDto> {
    return this.homeService.getHomeData();
  }
} 