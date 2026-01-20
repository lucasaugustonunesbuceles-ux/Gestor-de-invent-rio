
# 🚀 TheStok - Deploy no Render

Este guia contém as configurações exatas para hospedar o projeto no **Render**.

## ⚙️ Configurações Manuais (Static Site)

Se você for criar o serviço manualmente no painel do Render, use estes parâmetros:

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Node Version:** `18` ou superior

## 🔐 Variáveis de Ambiente

Para que a Inteligência Artificial (Gemini) funcione, você **PRECISA** adicionar esta variável no painel do Render (aba *Environment*):

| Key | Value |
| :--- | :--- |
| `API_KEY` | *Sua_Chave_do_Google_Gemini* |

> **Nota:** Não é necessário o prefixo `VITE_` pois configuramos o `vite.config.ts` para ler a chave diretamente.

## 🛠️ Deploy via Blueprint (Recomendado)

O projeto já contém um arquivo `render.yaml`. Para usar:
1. Vá em **New +** no Render.
2. Selecione **Blueprint**.
3. Conecte seu repositório.
4. O Render aplicará todas as configurações (Build, Dist, Routes) automaticamente.

## 🔄 Solução de Erros (RLS Supabase)
Se o app mostrar erros de permissão após o deploy:
1. Vá na aba **Config** dentro do app.
2. Copie o **Script SQL**.
3. Execute no **SQL Editor** do seu projeto no Supabase.
