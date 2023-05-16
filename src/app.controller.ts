import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus(): object {
    return { status: 'Alive' };
  }
}
