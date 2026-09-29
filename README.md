# Treino Rápido

Aplicação web mobile-first para gestão e execução de treinos, com foco em uso local, offline e em dispositivos móveis.

## Funcionalidades

- biblioteca de exercícios
- busca local por nome e categoria
- criação e edição de treinos
- configuração de séries, repetições, carga e descanso
- execução de treino com timer e pausa
- histórico de sessões
- evolução por volume e consistência
- backup em JSON para exportar/importar dados
- reset local de dados
- suporte básico a PWA e funcionamento offline
- build pronta para GitHub Pages

## Tecnologias

- React
- TypeScript
- Vite
- localStorage para persistência
- Service Worker básico
- PWA manifest

## Execução local

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Acesse:

- http://localhost:4173/

## Build de produção

```bash
npm run build
```

## Deploy no GitHub Pages

1. publique o projeto em um repositório do GitHub
2. garanta que a branch principal seja `main`
3. habilite GitHub Pages em Settings > Pages
4. use a opção "GitHub Actions"
5. o workflow em `.github/workflows/deploy.yml` fará o deploy automaticamente

## Observações

- os dados são armazenados localmente no navegador
- a aplicação é projetada para funcionar sem backend
- o uso offline depende do navegador e do cache do Service Worker
