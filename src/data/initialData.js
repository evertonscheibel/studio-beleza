export const INITIAL_SERVICES = [
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

export const INITIAL_PRODUCTS = [
  { id: 'prod-1', name: 'Óleo Reparador de Pontas 60ml', price: 55, stock: 12 },
  { id: 'prod-2', name: 'Máscara Reconstrutora Luxe 250g', price: 95, stock: 8 },
  { id: 'prod-3', name: 'Sérum Ativador de Sobrancelhas', price: 65, stock: 15 },
  { id: 'prod-4', name: 'Gel Calmante Pós-Depilatório 150ml', price: 40, stock: 10 },
];

export const INITIAL_STAFF = [
  { id: 'st-1', name: 'Camila Ferreira', role: 'Cabeleireira Master & Colorista', specialty: 'cabelo', color: '#D99B8B' },
  { id: 'st-2', name: 'Beatriz Lima', role: 'Designer de Sobrancelhas & Lash', specialty: 'sobrancelhas', color: '#B57064' },
  { id: 'st-3', name: 'Juliana Costa', role: 'Depiladora Especialista & Estética', specialty: 'depilacao', color: '#8F4A3E' },
];

// Data de hoje formatada YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

export const INITIAL_APPOINTMENTS = [
  {
    id: 'apt-101',
    date: today,
    time: '09:00',
    clientName: 'Mariana Duarte',
    clientPhone: '67998124455',
    serviceIds: ['cab-1', 'cab-5'], // Corte + Hidratação
    staffId: 'st-1',
    status: 'concluido', // agendado, atendendo, concluido, cancelado
    notes: 'Prefere corte em camadas leves, sem tirar comprimento.',
    payment: {
      method: 'pix',
      total: 230,
      paidAt: `${today} 10:15`
    }
  },
  {
    id: 'apt-102',
    date: today,
    time: '10:30',
    clientName: 'Fernanda Albuquerque',
    clientPhone: '67996541122',
    serviceIds: ['sob-2'], // Design com Henna
    staffId: 'st-2',
    status: 'atendendo',
    notes: 'Gosta de tom castanho médio, bem alinhado na ponta.',
    payment: null
  },
  {
    id: 'apt-103',
    date: today,
    time: '11:15',
    clientName: 'Renata Vasconcellos',
    clientPhone: '67991887733',
    serviceIds: ['dep-2', 'dep-5'], // Axila + Virilha
    staffId: 'st-3',
    status: 'agendado',
    notes: 'Pele muito sensível, usar cera elástica de camomila.',
    payment: null
  },
  {
    id: 'apt-104',
    date: today,
    time: '14:00',
    clientName: 'Camila Rodrigues',
    clientPhone: '67992336699',
    serviceIds: ['cab-3'], // Morena Iluminada
    staffId: 'st-1',
    status: 'agendado',
    notes: 'Avaliação prévia feita. Mechas em tons avelã e caramelo.',
    payment: null
  },
  {
    id: 'apt-105',
    date: today,
    time: '15:30',
    clientName: 'Letícia Mendonça',
    clientPhone: '67984112233',
    serviceIds: ['sob-3'], // Brow Lamination
    staffId: 'st-2',
    status: 'agendado',
    notes: 'Primeira vez com Lamination.',
    payment: null
  }
];

export const INITIAL_EXPENSES = [
  { id: 'exp-1', date: today, description: 'Café gourmet e biscoitos para recepção', amount: 48.50, category: 'conforto' },
  { id: 'exp-2', date: today, description: 'Reposição de toalhas e lençóis descartáveis', amount: 85.00, category: 'insumos' },
];
