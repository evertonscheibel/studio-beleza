// Base de Usuários Inicial com Administradora Principal
export const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Proprietária / Administradora',
    email: 'admin@salao.com',
    phone: '',
    role: 'admin', // 'admin', 'profissional', 'recepcao'
    password: 'admin', // Senha padrão inicial
    specialties: ['cabelo', 'sobrancelhas', 'depilacao'],
    commission: 100,
    status: 'ativo'
  }
];

// Catálogo de Serviços Especializados (Cabelo Feminino, Sobrancelhas e Depilação)
export const SUGGESTED_SERVICES_TEMPLATE = [
  // Cabelo Feminino
  { id: 'cab-1', category: 'cabelo', name: 'Corte Feminino & Finalização', price: 120, duration: 50, description: 'Corte personalizado, lavagem especial e modelagem com escova' },
  { id: 'cab-2', category: 'cabelo', name: 'Escova Modelada / Liso Espelhado', price: 70, duration: 40, description: 'Lavagem com massagem capilar e escova de longa durabilidade' },
  { id: 'cab-3', category: 'cabelo', name: 'Mechas Criativas & Morena Iluminada', price: 380, duration: 180, description: 'Descoloração com proteção Plex, tonalização e tratamento reconstrutor' },
  { id: 'cab-4', category: 'cabelo', name: 'Coloração Global / Retoque de Raiz', price: 160, duration: 90, description: 'Aplicação profissional com tinta premium e nutrição pós-cor' },
  { id: 'cab-5', category: 'cabelo', name: 'Hidratação Profunda & Cronograma', price: 110, duration: 45, description: 'Nutrição intensiva com reposição hídrica e selagem térmica' },
  { id: 'cab-6', category: 'cabelo', name: 'Botox Capilar / Alinhamento Antifrizz', price: 220, duration: 120, description: 'Redução de volume sem formol com brilho espelhado' },
  { id: 'cab-7', category: 'cabelo', name: 'Progressiva Orgânica Premium', price: 290, duration: 150, description: 'Alinhamento liso duradouro com ácidos nobres orgânicos' },

  // Sobrancelhas & Olhar
  { id: 'sob-1', category: 'sobrancelhas', name: 'Design de Sobrancelhas Personalizado', price: 50, duration: 30, description: 'Visagismo facial com pinça e linha para simetria ideal' },
  { id: 'sob-2', category: 'sobrancelhas', name: 'Design com Aplicação de Henna', price: 75, duration: 45, description: 'Design completo com pigmentação temporária em degradê natural' },
  { id: 'sob-3', category: 'sobrancelhas', name: 'Brow Lamination (Alinhamento dos Fios)', price: 140, duration: 60, description: 'Alinhamento, nutrição e fixação para sobrancelhas mais encorpadas' },
  { id: 'sob-4', category: 'sobrancelhas', name: 'Micropigmentação Shadow / Fio a Fio', price: 420, duration: 120, description: 'Preenchimento semi-permanente com efeito hiper-realista' },
  { id: 'sob-5', category: 'sobrancelhas', name: 'Lash Lifting com Hidratação de Queratina', price: 130, duration: 60, description: 'Curvatura e realce dos cílios naturais sem manutenção diária' },

  // Depilação Feminina
  { id: 'dep-1', category: 'depilacao', name: 'Depilação de Buço / Queixo', price: 25, duration: 15, description: 'Cera morna hipoalergênica suave' },
  { id: 'dep-2', category: 'depilacao', name: 'Depilação de Axilas', price: 35, duration: 20, description: 'Remoção com cera elástica calmante com camomila' },
  { id: 'dep-3', category: 'depilacao', name: 'Depilação Meia Perna', price: 45, duration: 30, description: 'Remoção até o joelho com loção pós-depilatória' },
  { id: 'dep-4', category: 'depilacao', name: 'Depilação Perna Inteira', price: 75, duration: 45, description: 'Perna completa com acabamento acetinado' },
  { id: 'dep-5', category: 'depilacao', name: 'Depilação Íntima Completa (Virilha Total)', price: 70, duration: 40, description: 'Virilha completa + perianal com cera própria para peles sensíveis' },
  { id: 'dep-6', category: 'depilacao', name: 'Depilação de Braços', price: 40, duration: 30, description: 'Cera morna com hidratação calmante' },
];

// Único serviço cadastrado diretamente no sistema
export const INITIAL_SERVICES = [
  {
    id: 'srv-1',
    category: 'cabelo',
    name: 'Corte e Escova Modelada',
    price: 150,
    duration: 60,
    description: 'Serviço profissional de alta qualidade.'
  }
];

export const INITIAL_PRODUCTS = [];

// Base zerada de agendamentos, despesas e clientes
export const INITIAL_APPOINTMENTS = [];
export const INITIAL_EXPENSES = [];
export const INITIAL_CLIENTS = [];
