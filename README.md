# ⚡ Creators — from Mateus Hwangmok

Sistema privado de gestão de creators parceiros.

---

## 📋 TUTORIAL COMPLETO — PASSO A PASSO PARA LEIGO

### ⏱ Tempo estimado: 30–40 minutos
### 💻 Você vai precisar: Computador, conta de e-mail, conta no GitHub

---

## PARTE 1 — PREPARAR O COMPUTADOR

### Passo 1 — Instalar o Node.js

1. Acesse **https://nodejs.org**
2. Clique no botão verde **"LTS (Recomendado)"**
3. Baixe e instale normalmente (next, next, finish)
4. Para confirmar, abra o **Terminal** (Mac) ou **Prompt de Comando** (Windows) e digite:
   ```
   node --version
   ```
   Deve aparecer algo como `v20.x.x`

### Passo 2 — Instalar o Git

1. Acesse **https://git-scm.com/downloads**
2. Baixe e instale para seu sistema operacional
3. Durante a instalação, deixe todas as opções padrão

---

## PARTE 2 — CONFIGURAR O SUPABASE (banco de dados)

### Passo 3 — Criar conta no Supabase

1. Acesse **https://supabase.com**
2. Clique em **"Start your project"**
3. Clique em **"Sign in with GitHub"** (ou crie uma conta nova)
4. Se pediu criar conta no GitHub primeiro, acesse **https://github.com**, clique em **"Sign up"** e crie uma conta gratuita

### Passo 4 — Criar um novo projeto

1. No painel do Supabase, clique em **"New project"**
2. Escolha uma organização (ou crie uma)
3. Preencha:
   - **Project name:** `creators-hwangmok` (ou qualquer nome)
   - **Database password:** crie uma senha forte e **ANOTE em local seguro**
   - **Region:** escolha `South America (São Paulo)`
4. Clique em **"Create new project"**
5. Aguarde 1–2 minutos enquanto o projeto é criado

### Passo 5 — Criar as tabelas do banco de dados

1. No painel esquerdo do Supabase, clique em **"SQL Editor"**
2. Clique em **"New query"** (botão no topo)
3. Abra o arquivo `supabase/schema.sql` do projeto no seu computador (com Bloco de Notas ou qualquer editor de texto)
4. Selecione todo o conteúdo (`Ctrl+A`) e copie (`Ctrl+C`)
5. Cole (`Ctrl+V`) na área do SQL Editor no Supabase
6. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
7. Deve aparecer uma mensagem de sucesso na parte de baixo

> ✅ Se aparecer "Success", as tabelas foram criadas corretamente!

### Passo 6 — Criar o bucket de fotos (Storage)

1. No painel esquerdo do Supabase, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Preencha:
   - **Name:** `creator-photos`
   - Marque a opção **"Public bucket"** (sim, deixe público)
4. Clique em **"Save"**

5. Agora vá de volta ao **"SQL Editor"**, crie uma nova query e cole:
```sql
create policy "storage: creator faz upload na própria pasta"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'creator-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage: leitura pública das fotos"
  on storage.objects for select
  using (bucket_id = 'creator-photos');
```
6. Clique em **"Run"**

### Passo 7 — Pegar as credenciais do Supabase

1. No painel esquerdo, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Você vai ver dois dados importantes — **ANOTE os dois**:
   - **Project URL** — algo como `https://xxxxxxxxxxx.supabase.co`
   - **anon public** (dentro de "Project API keys") — uma chave longa começando com `eyJ...`

---

## PARTE 3 — BAIXAR E CONFIGURAR O PROJETO

### Passo 8 — Baixar o projeto

Você recebeu o arquivo `.zip` com o projeto. Extraia ele em uma pasta fácil de encontrar, por exemplo:
- Windows: `C:\projetos\creators-app\`
- Mac: `/Users/seuusuario/projetos/creators-app/`

### Passo 9 — Criar o arquivo de configuração

1. Na pasta do projeto, você vai ver um arquivo chamado `.env.example`
2. **Copie** esse arquivo e **renomeie a cópia** para `.env`
   - No Windows: clique com botão direito → Copiar → colar → renomear para `.env`
   - No Mac: `cp .env.example .env`
3. Abra o arquivo `.env` com o Bloco de Notas (Windows) ou TextEdit (Mac)
4. Substitua os valores:

```
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_ADMIN_EMAIL=SEU@EMAIL.COM
```

Cole exatamente os valores que você anotou no Passo 7.

5. Salve o arquivo

### Passo 10 — Abrir o Terminal na pasta do projeto

**No Windows:**
1. Abra a pasta do projeto no Explorador de Arquivos
2. Clique na barra de endereço (onde mostra o caminho), apague tudo e digite `cmd`, pressione Enter
3. Um Prompt de Comando vai abrir já na pasta certa

**No Mac:**
1. Abra o Terminal (pesquise "Terminal" no Spotlight)
2. Digite `cd ` (com espaço) e arraste a pasta do projeto para dentro do Terminal
3. Pressione Enter

### Passo 11 — Instalar as dependências

No Terminal, com a pasta do projeto aberta, digite:
```
npm install
```
Aguarde terminar (pode demorar 1–2 minutos).

### Passo 12 — Testar localmente

Digite no Terminal:
```
npm run dev
```

Deve aparecer algo como:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:3000/
```

Abra seu navegador e acesse **http://localhost:3000**

> ✅ O sistema deve aparecer! Se aparecer a tela inicial, está funcionando.

Para parar, pressione `Ctrl+C` no Terminal.

---

## PARTE 4 — CRIAR SUA CONTA DE ADMINISTRADOR

### Passo 13 — Criar sua conta

1. Com o sistema rodando, acesse http://localhost:3000
2. Clique em **"Criar minha conta"**
3. Preencha seus dados com **o mesmo e-mail que você colocou no `.env`**
4. Conclua o cadastro

### Passo 14 — Promover sua conta a administrador

1. No painel do Supabase, vá em **"SQL Editor"**
2. Clique em **"New query"**
3. Abra o arquivo `supabase/admin_setup.sql` e substitua `SEU_EMAIL@exemplo.com` pelo seu e-mail
4. Cole o SQL e clique em **"Run"**
5. Sua conta agora é administrador!

6. Volte ao sistema e faça login — você será redirecionado para o **Painel Master**

---

## PARTE 5 — PUBLICAR NA INTERNET (Deploy na Vercel)

### Passo 15 — Subir o projeto no GitHub

1. Acesse **https://github.com** e faça login
2. Clique no **"+"** no canto superior direito → **"New repository"**
3. Nome: `creators-hwangmok`
4. Deixe como **Private** (privado)
5. Clique em **"Create repository"**
6. GitHub vai mostrar comandos. No Terminal do projeto, execute:
```
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/creators-hwangmok.git
git push -u origin main
```
> Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub

### Passo 16 — Publicar na Vercel

1. Acesse **https://vercel.com**
2. Clique em **"Sign Up"** → **"Continue with GitHub"**
3. Autorize a Vercel a acessar sua conta GitHub
4. Clique em **"New Project"**
5. Encontre o repositório `creators-hwangmok` e clique em **"Import"**
6. Na tela de configuração, **não mude nada** — apenas adicione as variáveis de ambiente:
   - Clique em **"Environment Variables"**
   - Adicione cada variável do arquivo `.env`:
     - Nome: `VITE_SUPABASE_URL` → Valor: sua URL do Supabase
     - Nome: `VITE_SUPABASE_ANON_KEY` → Valor: sua chave anon
     - Nome: `VITE_ADMIN_EMAIL` → Valor: seu e-mail
7. Clique em **"Deploy"**
8. Aguarde 1–2 minutos

> ✅ Quando terminar, a Vercel vai mostrar uma URL como `https://creators-hwangmok.vercel.app`

**Seu sistema está no ar!** 🎉

---

## PARTE 6 — ATUALIZAÇÕES FUTURAS

Sempre que quiser atualizar o sistema:
1. Faça as alterações nos arquivos
2. No Terminal, execute:
```
git add .
git commit -m "descrição da alteração"
git push
```
3. A Vercel detecta automaticamente e faz o deploy novo

---

## ❓ PROBLEMAS COMUNS

**Erro: "VITE_SUPABASE_URL is not defined"**
→ O arquivo `.env` não foi criado corretamente. Verifique o Passo 9.

**Erro: "Invalid login credentials"**
→ E-mail ou senha errados. Tente recuperar a senha.

**Fotos não aparecem**
→ Verifique se o bucket `creator-photos` foi criado como público (Passo 6).

**Não aparece o Painel Master**
→ Execute o SQL do Passo 14 para promover sua conta a admin.

**Site carrega mas está em branco**
→ Abra o console do navegador (F12) e veja o erro. Provavelmente as variáveis de ambiente estão erradas na Vercel.

---

## 📞 SUPORTE

Em caso de dúvidas técnicas, busque suporte com um desenvolvedor informando:
- A mensagem de erro exata
- Em qual passo o problema ocorreu
- Qual sistema operacional você usa
