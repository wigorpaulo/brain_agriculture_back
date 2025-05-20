import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Back-end: Gerenciador de cadastro de produtores rurais';
  }
}
