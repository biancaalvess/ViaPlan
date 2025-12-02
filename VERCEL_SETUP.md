# ⚡ Configuração Rápida - Vercel

## 📝 Configurações para colar no Vercel

### Na tela de criação do projeto:

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Variáveis de Ambiente (Settings > Environment Variables):

```
Key: VITE_API_BASE_URL
Value: https://viaplan-backend.onrender.com/
Environments: ☑ Production ☑ Preview ☑ Development
```

## ✅ O que já está configurado:

- ✅ `vercel.json` criado com todas as configurações necessárias
- ✅ Rewrites para SPA (Single Page Application)
- ✅ Cache headers para assets
- ✅ `.gitignore` atualizado

## 🚀 Próximos Passos:

1. **No Vercel**, cole as configurações acima
2. **Adicione a variável de ambiente** `VITE_API_BASE_URL`
3. **Clique em Deploy**
4. **Pronto!** 🎉

## 📌 Nota Importante:

O arquivo `vercel.json` já está no repositório e será usado automaticamente. Você pode deixar os campos do Vercel em branco que ele usará as configurações do arquivo, OU preencher manualmente como mostrado acima.

