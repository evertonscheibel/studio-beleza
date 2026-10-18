# ✨ Bella Studio & Co. — Gestão Especializada para Salão Feminino

Sistema enxuto, ágil e intuitivo desenvolvido sob medida para a rotina de **salões femininos**, especializado em **Cabelos**, **Sobrancelhas** e **Depilação**.

Projetado para eliminar excessos e telas burocráticas, unificando a experiência da profissional e da recepção com visual elegante (*Rose Gold & Champagne Luxury*).

---

## 🌟 Diferenciais & Funcionalidades Enxutas

1. **Agenda do Dia & Na Cadeira Unificada**:
   - Visualização cronológica dos horários com identificação imediata de status (*Agendado*, *Na Cadeira / Atendendo*, *Concluído*).
   - Início de atendimento em 1 clique.
   - Botão **"Avisar no WhatsApp"**: Gera mensagem personalizada no WhatsApp da cliente com data, horário e serviços agendados, sem necessidade de digitar nada.

2. **Fechamento de Comanda Rápido (Checkout)**:
   - A comanda já nasce pronta a partir do agendamento.
   - Adição opcional de produtos de revenda (*home care*) ou procedimentos extras feitos na hora.
   - Cálculo automático de troco para dinheiro e registro da forma de pagamento (*Pix, Cartão de Crédito, Débito ou Dinheiro*).
   - Confirmação com animação comemorativa e registro contábil imediato.

3. **Catálogo Especializado por Categorias**:
   - ✂️ **Cabelo Feminino**: Cortes, Mechas Criativas / Morena Iluminada, Coloração, Escovas, Hidratação Profunda, Botox e Progressivas Orgânicas.
   - ✨ **Sobrancelhas & Olhar**: Design Visagista, Aplicação de Henna, Brow Lamination, Micropigmentação e Lash Lifting.
   - 🌸 **Depilação Feminina**: Cera hipoalergênica para Buço, Axilas, Pernas, Braços e Íntima Completa.

4. **Clientes & Fidelidade**:
   - Histórico consolidado de visitas, total investido e serviços mais pedidos pela cliente.
   - Botão de retorno direto no WhatsApp para lembretes de retoque e campanhas especiais.

5. **Governança Financeira & Backup Descomplicado**:
   - Resumo financeiro diário: Total Faturado, Despesas Rápidas do Salão e Lucro Líquido.
   - Exportação e Importação de Backup completo em arquivo `.json`.
   - Persistência automática em `localStorage` para navegação segura e offline.
   - Alternador de tema Claro (*Warm Luxury*) e Escuro (*Espresso Dark*).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) versão 18+ instalada.

### Instalação & Execução
```bash
# 1. Entre no diretório do projeto
cd studio-beleza

# 2. Instale as dependências (já instaladas localmente)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Abra a URL indicada no terminal (geralmente `http://localhost:5173/`).

---

## 📦 Build para Produção
```bash
npm run build
```
Os arquivos otimizados e prontos para publicação em qualquer servidor (Vercel, Netlify, Nginx, Hostinger, GitHub Pages) serão gerados na pasta `dist/`.

---

## 💻 Tecnologias
* **React 19**
* **Vite**
* **Lucide React** (Ícones modernos e leves)
* **Canvas Confetti** (Micro-interações de celebração)
* **Design System Vanilla CSS** (Zero dependência de frameworks pesados, 100% customizado)
