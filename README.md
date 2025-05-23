<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Brain Agriculture - API de Produtores Rurais

Esta aplicação é parte de um teste técnico e tem como objetivo o cadastro e gestão de produtores rurais, suas propriedades, culturas e safras.

## Tecnologias

- [NestJS](https://nestjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [TypeORM](https://typeorm.io/)
- [Docker](https://www.docker.com/)
- [Swagger](https://swagger.io/)
- [Jest](https://jestjs.io/)

### Requisitos

- Node.js 22.15.0
- Postgresql 17

## Como rodar o projeto com Docker

```bash
# Clonar o projeto
git clone https://github.com/wigorpaulo/brain_agriculture_back.git
cd brain-agriculture

# Subir os containers
docker-compose up --build

```

A API estará disponível em: http://localhost:3000

# Rodar testes

```bash
# Testes unitários
npm run test

# e2e tests
$ npm run test:e2e

# Testes com cobertura
npm run test:cov
```

# Documentação da API

A documentação Swagger estará disponível em:

http://localhost:3000/api

# Requisitos implementados

- Cadastro de produtores rurais

- Validação de CPF/CNPJ

- Relacionamento entre propriedades, culturas e safras

- Dashboard com estatísticas e gráficos

- Testes unitários e integração

- Swagger com contrato da API

- Docker com PostgreSQL

- Logs com Logger do NestJS

# Bônus: Se conseguir disponibilizar a aplicação na nuvem e acessível via internet, será um diferencial!

Sistema disponivel: https://brain-agriculture-back.fly.dev/

A documentação Swagger estará disponível em: https://brain-agriculture-back.fly.dev/api

## Diagrama do banco de dados

![Diagrama](./diagramDB.png)