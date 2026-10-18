# ✨ Belíssima — Gestão Especializada para Salão Feminino

Sistema enxuto, ágil e intuitivo desenvolvido sob medida para a rotina de **salões femininos**, especializado em **Cabelos**, **Sobrancelhas** e **Depilação**.

Identidade visual nobre inspirada na alta estética: **Bege (Linho/Areia), Verde Quartel (Militar Nobre) e Dourado (Ouro Acetinado)**, com arquitetura **Mobile-First** nativa.

---

## 🌟 Principais Funcionalidades

1. **Controle de Usuários & Equipe Integrado**:
   - Gestão de equipe com perfis de permissão:
     - 👑 **Administradora / Proprietária** (Acesso total, governança financeira, equipe e reset)
     - 💼 **Recepção & Caixa** (Agendamentos gerais, comandas e recebimentos)
     - ✂️ **Profissional / Atendente** (Agenda própria e execução de atendimentos)
   - Cadastro com comissão (%), WhatsApp, especialidades e status ativo/inativo.
   - Alternador rápido de operador/sessão ativa no topo em 1 clique.

2. **Base Zerada & Início Limpo**:
   - Sistema inicializado limpo (sem agendamentos fictícios ou despesas de teste), pronto para receber os clientes reais do salão.
   - Botão **"Carregar Sugestões Prontas"** no catálogo de serviços para carregar 18 procedimentos femininos com 1 clique.
   - Botão **"Zerar Sistema do Salão"** em Configurações para reiniciar os lançamentos a qualquer momento.

3. **Agenda & Comanda Inteligente (Mobile-First)**:
   - Visualização em lista e cartões de horários rápidos (*Agendado*, *Na Cadeira*, *Concluído*).
   - Botão **"Avisar no WhatsApp"**: Mensagem personalizada automática com data, hora e serviços.
   - Modais em formato **Bottom Sheet** no celular com alça de arrasto e botões de ação fixos no rodapé (*Sticky Footer*).
   - Seletor de serviços vertical compacto, 100% visível, sem cortes de texto.

4. **Caixa & Fechamento Ágil**:
   - Recebimentos em Pix, Cartão de Crédito/Débito e Dinheiro com cálculo automático de troco e comemoração com *confetti*.
   - Inclusão opcional de produtos de revenda (*home-care*) diretamente na comanda.

5. **Clientes & Fidelidade**:
   - Histórico consolidado de visitas, valor total investido e atalho direto para reconexão no WhatsApp.

6. **Identidade Visual**:
   - **Bege Suave**: Tons areia, linho e champagne suave para os fundos e cartões.
   - **Verde Quartel (Militar Nobre)**: Tom terroso elegante para botões de ação, status e contrastes.
   - **Dourado Acetinado**: Ícones nobres, estrelas, bordas finas e detalhes de prestígio.
   - Suporte completo a Modo Claro e Modo Escuro (*Dark Militar*).

---

## 🚀 Como Executar Localmente

```bash
# 1. Entre na pasta
cd studio-beleza

# 2. Inicie o servidor
npm run dev
```
Abra em `http://localhost:5188/`.

---

## 📦 Build para Produção
```bash
npm run build
```
Arquivos otimizados gerados na pasta `dist/`.

---

## 💻 Tecnologias
* **React 19**
* **Vite**
* **Lucide React**
* **Canvas Confetti**
* **Vanilla CSS Design System** (Cores: Bege, Verde Quartel e Dourado)
