# Parte 1: Build da aplicação React
FROM node:20-alpine AS build

# Define a diretoria de trabalho dentro do contentor
WORKDIR /app

# Copia os ficheiros de dependências
COPY package*.json ./

# Instala as dependências de forma "limpa"
RUN npm ci

# Copia o resto do código da aplicação
COPY . .

# Executa o comando de build (gera a pasta /build)
RUN npm run build

# Parte 2: Servir a aplicação com Nginx
FROM nginx:stable-alpine

# Copia os ficheiros estáticos da etapa de build para a pasta que o Nginx usa
COPY --from=build /app/build /usr/share/nginx/html

# Expor a porta 80 (a porta standard da web)
EXPOSE 80

# Iniciar o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]