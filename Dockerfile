FROM node:22.15.0-alpine3.21 AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta da aplicação NestJS
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:dev"]