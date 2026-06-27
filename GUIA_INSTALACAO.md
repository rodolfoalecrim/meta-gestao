# 🐄 LeitePRO — Guia de Instalação Completo

## O que você tem neste pacote

| Arquivo | Para quem | O que faz |
|---|---|---|
| `app-vendedor.html` | Vendedores (celular) | Cadastrar e consultar propriedades |
| `admin.html` | Rodolfo (você) | Dashboard, comparativos, gestão de status |

---

## PASSO 1 — Criar conta gratuita no Firebase

1. Acesse **https://console.firebase.google.com**
2. Clique em **"Criar projeto"**
3. Nome do projeto: `leitepro-sistema`
4. Desative Google Analytics → clique **"Criar"**

---

## PASSO 2 — Ativar Autenticação (login dos usuários)

1. No menu lateral: **Build → Authentication**
2. Clique **"Começar"**
3. Na aba "Sign-in method" → clique **Email/Senha** → ative → salve

### Criar usuário ADMIN (você):
1. Aba **"Usuários"** → "Adicionar usuário"
2. Email: `rodolfo.alecrim@gmail.com`
3. Senha: (crie uma senha forte, ex: `LeiteP@2025!`)

### Criar usuários dos vendedores:
Repita o processo para cada vendedor:
- `alexandre@leitepro.app` → senha de sua escolha
- `lucas@leitepro.app`
- `paulo@leitepro.app`
- `vagner@leitepro.app`
- `maicon@leitepro.app`
- `arthur@leitepro.app`
- `julio@leitepro.app`
- `joziel@leitepro.app`

> 💡 **Dica:** Use uma senha padrão inicial (ex: `Leite2025`) e peça para cada vendedor trocar depois.

---

## PASSO 3 — Ativar Banco de Dados (Realtime Database)

1. Menu lateral: **Build → Realtime Database**
2. Clique **"Criar banco de dados"**
3. Localização: **us-central1** (padrão)
4. Modo inicial: **"Iniciar no modo de teste"** → confirmar
5. Clique **"Ativar"**

### Configurar regras de segurança:
1. Na aba **"Regras"**, substitua tudo por:

```json
{
  "rules": {
    "propriedades": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

2. Clique **"Publicar"**

---

## PASSO 4 — Copiar credenciais do Firebase

1. Clique na **engrenagem** (⚙️) → **"Configurações do projeto"**
2. Role até **"Seus aplicativos"**
3. Clique no ícone **`</>`** (Web)
4. Nome do app: `leitepro` → clique **"Registrar app"**
5. Copie o bloco `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // ← copie isso
  authDomain: "leitepro-sistema.firebaseapp.com",
  databaseURL: "https://leitepro-sistema-default-rtdb.firebaseio.com",
  projectId: "leitepro-sistema",
  storageBucket: "leitepro-sistema.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

---

## PASSO 5 — Colar credenciais nos arquivos HTML

Abra **`app-vendedor.html`** em qualquer editor de texto (Bloco de Notas, etc.)

Encontre este trecho (linha ~230):
```javascript
const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "COLE_AQUI.firebaseapp.com",
  ...
```

Substitua pelos valores copiados no Passo 4.

**Repita o mesmo processo** no arquivo **`admin.html`**.

---

## PASSO 6 — Publicar os arquivos na internet (grátis)

### Opção A — Netlify (mais fácil, recomendado):

1. Acesse **https://netlify.com** → crie conta gratuita
2. Arraste os 2 arquivos HTML para a área de upload
3. O Netlify gera URLs automáticas, ex:
   - `https://meu-projeto.netlify.app/app-vendedor.html`
   - `https://meu-projeto.netlify.app/admin.html`

### Opção B — GitHub Pages:

1. Crie conta em **https://github.com**
2. Crie repositório público: `leitepro`
3. Faça upload dos arquivos
4. Ative GitHub Pages em Settings → Pages
5. URLs serão: `https://seunome.github.io/leitepro/app-vendedor.html`

---

## PASSO 7 — Instalar como PWA no celular

### Android (Chrome):
1. Acesse a URL do `app-vendedor.html` no Chrome
2. Menu (3 pontos) → **"Adicionar à tela inicial"**
3. O app aparece como ícone na home

### iPhone (Safari):
1. Acesse a URL no Safari
2. Toque no ícone de compartilhar (📤)
3. Role e toque em **"Adicionar à Tela de Início"**

---

## RESUMO — Como vai funcionar

```
Vendedor (celular)                 Rodolfo (computador ou celular)
       │                                         │
       ▼                                         ▼
app-vendedor.html              admin.html
 • Faz login                    • Faz login
 • Cadastra propriedade         • Vê TUDO em tempo real
 • Edita seus clientes          • Muda status (ativo/inativo)
 • Vê seus resultados           • Dashboard completo
       │                         • Comparativo ativos vs inativos
       └────────────────────────▶ • Exporta CSV
              Firebase DB         • Qualidade do leite
         (sincroniza em tempo      • Performance por vendedor
              real)
```

---

## Senhas para os vendedores (sugestão)

Envie para cada vendedor via WhatsApp:

> *"Olá [nome]! Segue seu acesso ao LeitePRO:*
> *• Link: https://[sua-url]/app-vendedor.html*
> *• E-mail: [email]@leitepro.app*
> *• Senha: Leite2025*
> *Instale como app no celular pelo botão 'Adicionar à tela inicial'"*

---

## Suporte / Dúvidas

Se precisar de ajuda com qualquer etapa, entre em contato.

**Sistema criado em:** Junho 2025
**Firebase plan:** Spark (gratuito — até 50k leituras/dia, 20k escritas/dia, 1GB armazenamento)
