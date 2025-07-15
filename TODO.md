# TODO - Dashboard IEGM

## Fase 1: Setup e Features Iniciais

- [x] **Frontend:** Instalar e configurar o Tailwind CSS no projeto Vite.
- [x] **Dados:** Aprimorar o script de migração (`scripts/migrate-data.ts`) para ser idempotente (não re-importar dados existentes).
- [x] **Dados:** Integrar o script de migração ao comando `npm run build`.
- [ ] **Dados:** Remover a migração do `npm run dev`.
- [x] **Frontend:** Implementar uma seção/componente para listar e permitir o download dos arquivos de dataset.
- [x] **DevOps:** Criar a estrutura básica do Terraform (`terraform/main.tf`) para gerenciar a infraestrutura na Cloudflare.

## Fase 2: Deploy e Automação

- [x] **DevOps:** Definir os recursos `cloudflare_pages_project` e `cloudflare_d1_database` no Terraform.
- [x] **DevOps:** Criar um workflow de CI/CD (GitHub Actions) para build, migração de dados e deploy no Cloudflare Pages.
- [ ] **Docs:** Documentar o processo de setup e deploy no `README.md`.

## Fase 3: Manutenção e Melhorias

- [ ] **Bugs:** Identificar, listar e corrigir os bugs atuais do dashboard. (A ser detalhado)
  - [x] **Dados:** Corrigir inconsistência de dados (duplicata de municípios, médias hardcoded).
- [ ] **Melhorias (UX/UI):** Analisar o dashboard atual e propor melhorias de usabilidade e visualização de dados.
- [ ] **Melhoria:** Refatorar componentes conforme necessário após a correção de bugs e implementação de melhorias.