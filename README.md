# Serviço de Agendamento

Este é um serviço de agendamento que inclui funcionalidades como controle de usuários, gestão de acessos, agendamento e cancelamento de compromissos. Além disso, o serviço envia notificações por E-mail e por WebSocket.

## Tecnologias Utilizadas

- **Redis**: Utilizado para cache e suporte a WebSocket.
- **RabbitMQ**: Gerencia filas de agendamentos para garantir o processamento assíncrono e eficiente dos mesmos.
- **PostgreSQL**: Banco de dados relacional para armazenamento das informações do sistema.
- **NestJS**: Framework utilizado para desenvolver o backend do serviço.
- **Swagger**: Documentação interativa disponível em `http://localhost:<porta>/docs`.

## Funcionalidades

- **Controle de Usuários e Acessos**: Permite gerenciar usuários e suas permissões.
- **Agendamentos**: Possibilita criar e cancelar agendamentos.
- **Notificações**:
  - Envio de email quando o horário do agendamento é alcançado.
  - Disparo de notificações em tempo real via WebSocket.

## Documentação da API

A documentação da API está disponível em:

```
http://localhost:<porta>/docs
```

Substitua `<porta>` pela porta configurada no seu ambiente.

---

## Como Executar o Projeto

### Pré-requisitos

- **Docker**: Necessário para executar os serviços.
  - Instale o Docker seguindo as instruções em: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- **Node.js com NVM**: Utilize o Node Version Manager (NVM) para gerenciar a versão do Node.js.
  - Instale o NVM seguindo as instruções em: [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
  - Após instalar o NVM, instale o Node.js:
    ```bash
    nvm install --lts
    nvm use --lts
    ```
- **PNPM**: Gerenciador de pacotes recomendado para este projeto.
  - Instale o PNPM globalmente:
    ```bash
    npm install -g pnpm
    ```

### Passo a Passo

1. Copie o arquivo `.env.example` para `.env`:

   ```bash
   cp .env.example .env
   ```

2. Configure o OAuth2 do Google

Para que o envio de emails funcione corretamente, é necessário configurar o OAuth2 do Google. Siga este tutorial para obter as credenciais necessárias: [Sending Emails Securely Using Node.js, Nodemailer, SMTP, Gmail, and OAuth2](https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a).

Preencha as seguintes variáveis no arquivo `.env`:

```env
EMAIL=
REFRESH_TOKEN=
CLIENT_SECRET=
CLIENT_ID=
```

Essas informações serão utilizadas para autenticar o envio de emails.

3. Inicie os serviços utilizando o Docker Compose:

   ```bash
   docker-compose up -d
   ```

4. Instale as dependências do projeto:

   ```bash
   pnpm install
   ```

5. Execute a aplicação:
   ```bash
   pnpm run start
   ```

---

## Contato

Caso encontre algum problema ou tenha dúvidas, entre em contato com bernardo.felix.job@gmail.com. 🚀
