# Projeto de Sistema de Gerenciamento de Criptomoedas 🚀

Este projeto é um sistema de gerenciamento de criptomoedas com funcionalidades de conversão de moedas, favoritos e histórico de transações, usando **NestJS**, **Prisma** e **SQLite** como tecnologias principais.

## Tabela de Conteúdos
- [Visão Geral](#visao-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Configuração](#instalacao-e-configuracao)
- [Endpoints da API](#endpoints-da-api)
- [Exemplos de Uso](#exemplos-de-uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Contribuição](#contribuicao)
- [Licença](#licenca)

---

## Visão Geral

O sistema fornece uma API para gerenciar conversões de criptomoedas e permite que os usuários mantenham uma lista de favoritos e histórico de conversões. Ele é protegido com autenticação JWT e inclui uma documentação Swagger para fácil visualização dos endpoints.

## Tecnologias Utilizadas

- **Node.js** com **NestJS** - Framework de backend
- **Prisma ORM** - Mapeamento e manipulação de banco de dados
- **SQLite** - Banco de dados embutido e leve
- **Swagger** - Documentação de API
- **JWT** - Autenticação e Autorização
- **Jest** - Testes unitários e de integração

## Instalação e Configuração

### Pré-requisitos

- **Node.js** v14+
- **Yarn** ou **npm**
- **SQLite** (usado pelo Prisma automaticamente)
- **Configuração de variáveis de ambiente**

### Passo a Passo de Instalação

1. **Clone o Repositório**
    ```bash
    git clone https://github.com/gbbgabriel/projeto-crypto.git
    cd projeto-crypto
    ```

2. **Instale as Dependências**
    ```bash
    npm install
    ```

3. **Configuração do Banco de Dados**
    - Defina a variável `DATABASE_URL` no arquivo `.env` para SQLite:
      ```plaintext
      DATABASE_URL="file:./dev.db"
      ```

4. **Prisma - Migrate e Seed**
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

5. **Iniciar o Servidor**
    ```bash
    npm run start:dev
    ```

6. **Acesse a Documentação da API**
    - Após iniciar o servidor, acesse [http://localhost:3000/api-docs](http://localhost:3000/api-docs) para visualizar a documentação gerada pelo Swagger.

---

## Endpoints da API

### Autenticação (`/auth`)
- **POST /auth/signup** - Cria uma nova conta de usuário
- **POST /auth/login** - Realiza o login e retorna um token JWT

### Usuários (`/user`)
- **GET /user/me** - Retorna o perfil do usuário autenticado
- **PATCH /user/:id** - Atualiza as informações de um usuário
- **DELETE /user/:id** - Remove um usuário do sistema

### Criptomoedas (`/crypto`)
- **GET /crypto/list** - Lista todas as criptomoedas disponíveis
- **POST /crypto/convert** - Converte uma criptomoeda para BRL e USD
- **POST /crypto/favorite** - Adiciona uma criptomoeda aos favoritos do usuário
- **POST /crypto/unfavorite** - Remove uma criptomoeda dos favoritos
- **GET /crypto/history** - Retorna o histórico de conversões do usuário
- **GET /crypto/favorites** - Lista as criptomoedas favoritas do usuário

## Exemplos de Uso

### 1. Registro de Usuário
**Request**
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "User Test",
  "email": "user@example.com",
  "password": "password123!"
}
```

**Response**
```json
{
  "access_token": "eyJhbGciOiJIUzI1..."
}
```

### 2. Conversão de Criptomoeda
**Request**
```http
POST /crypto/convert
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "crypto": "bitcoin",
  "amount": 2
}
```

**Response**
```json
{
  "valueBRL": 120000.00,
  "valueUSD": 22000.00
}
```

---

## Estrutura do Projeto

- `src/`
    - `auth/` - Módulo de autenticação
    - `crypto/` - Módulo de gerenciamento de criptomoedas
    - `user/` - Módulo de gestão de usuários
    - `common/` - Serviços e filtros reutilizáveis
    - `database/` - Configuração do Prisma e modelos de banco de dados
    - `decorators/` - Decoradores personalizados
    - `filters/` - Filtros de exceção personalizados

## Testes

Os testes são realizados com **Jest**. Para executar os testes, utilize o comando:
```bash
npm run test
```
Testes unitários e de integração estão incluídos para garantir a qualidade do código.

