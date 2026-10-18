import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  DollarSign,
  Phone,
  MessageCircle,
  Users,
  TrendingUp,
  Receipt,
  Trash2,
  Edit3,
  Moon,
  Sun,
  Download,
  Upload,
  UserCheck,
  Check,
  X,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Sparkle
} from 'lucide-react';
import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  SUGGESTED_SERVICES_TEMPLATE,
  INITIAL_PRODUCTS,
  INITIAL_APPOINTMENTS,
  INITIAL_EXPENSES
} from './data/initialData';
import './App.css';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('belissima_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('belissima_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Check version reset to guarantee fresh zeroed start for Belíssima
  useEffect(() => {
    const initialized = localStorage.getItem('belissima_v1_ready');
    if (!initialized) {
      localStorage.setItem('belissima_users', JSON.stringify(INITIAL_USERS));
      localStorage.setItem('belissima_services', JSON.stringify(INITIAL_SERVICES));
      localStorage.setItem('belissima_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
      localStorage.setItem('belissima_expenses', JSON.stringify(INITIAL_EXPENSES));
      localStorage.setItem('belissima_v1_ready', 'true');
    }
  }, []);

  // Main Entities State with LocalStorage
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('belissima_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedId = localStorage.getItem('belissima_active_user_id');
    const found = users.find(u => u.id === savedId);
    return found || users[0] || INITIAL_USERS[0];
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('belissima_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('belissima_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('belissima_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [products] = useState(INITIAL_PRODUCTS);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('belissima_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem('belissima_active_user_id', currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('belissima_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('belissima_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('belissima_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Navigation: 'agenda', 'caixa', 'servicos', 'clientes', 'equipe', 'financeiro'
  const [activeTab, setActiveTab] = useState('agenda');

  // Date Filter (defaults to today)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Status Filter in Agenda
  const [statusFilter, setStatusFilter] = useState('todos');

  // Search in Clients / Services / Team
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutAppointment, setCheckoutAppointment] = useState(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchDate = apt.date === selectedDate;
      if (!matchDate) return false;
      if (statusFilter === 'todos') return true;
      return apt.status === statusFilter;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate, statusFilter]);

  // Daily Financial Metrics
  const dailyStats = useMemo(() => {
    const dayAppointments = appointments.filter(a => a.date === selectedDate);
    const paidAppointments = dayAppointments.filter(a => a.status === 'concluido' && a.payment);

    const totalRevenue = paidAppointments.reduce((acc, curr) => acc + (curr.payment?.total || 0), 0);
    const totalClients = dayAppointments.length;
    const completedCount = paidAppointments.length;
    const inServiceCount = dayAppointments.filter(a => a.status === 'atendendo').length;
    const pendingCount = dayAppointments.filter(a => a.status === 'agendado').length;

    const dayExpenses = expenses
      .filter(e => e.date === selectedDate)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalRevenue,
      netProfit: totalRevenue - dayExpenses,
      totalClients,
      completedCount,
      inServiceCount,
      pendingCount,
      dayExpenses
    };
  }, [appointments, expenses, selectedDate]);

  // Clients Aggregated from Appointments
  const clientsList = useMemo(() => {
    const map = new Map();
    appointments.forEach(apt => {
      const phone = apt.clientPhone.replace(/\D/g, '');
      if (!phone) return;

      const existing = map.get(phone) || {
        name: apt.clientName,
        phone: apt.clientPhone,
        totalVisits: 0,
        totalSpent: 0,
        lastVisit: apt.date,
        servicesDone: []
      };

      existing.totalVisits += 1;
      if (apt.payment?.total) {
        existing.totalSpent += apt.payment.total;
      }
      if (apt.date > existing.lastVisit) {
        existing.lastVisit = apt.date;
      }
      apt.serviceIds.forEach(id => {
        const s = services.find(x => x.id === id);
        if (s && !existing.servicesDone.includes(s.name)) {
          existing.servicesDone.push(s.name);
        }
      });

      map.set(phone, existing);
    });

    return Array.from(map.values()).filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [appointments, services, searchQuery]);

  // Quick Action: Send WhatsApp Confirmation
  const sendWhatsApp = (apt) => {
    const serviceNames = apt.serviceIds
      .map(id => services.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const dateFormatted = apt.date.split('-').reverse().join('/');
    const text = encodeURIComponent(
      `Olá, ${apt.clientName}! ✨ Tudo bem?\n\nPassando para confirmar seu horário no *Belíssima*:\n📅 *Data:* ${dateFormatted} às *${apt.time}h*\n✂️ *Serviço(s):* ${serviceNames}\n\nPodemos confirmar? Qualquer dúvida ou se precisar ajustar, é só me avisar aqui. Te esperamos com muito carinho! 💕`
    );

    const cleanPhone = apt.clientPhone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://api.whatsapp.com/send?phone=${fullPhone}&text=${text}`, '_blank');
    showToast('WhatsApp aberto com a mensagem do Belíssima pronta!');
  };

  const handleStartService = (aptId) => {
    setAppointments(prev =>
      prev.map(a => (a.id === aptId ? { ...a, status: 'atendendo' } : a))
    );
    showToast('Atendimento iniciado! Cliente na cadeira.');
  };

  const handleOpenCheckout = (apt) => {
    setCheckoutAppointment(apt);
    setIsCheckoutModalOpen(true);
  };

  const handleDeleteAppointment = (aptId) => {
    if (window.confirm('Tem certeza que deseja cancelar/remover este agendamento?')) {
      setAppointments(prev => prev.filter(a => a.id !== aptId));
      showToast('Agendamento removido.');
    }
  };

  // System Zero Reset Action
  const handleResetSystemToZero = () => {
    const confirmText = window.prompt(
      '⚠️ ATENÇÃO: Deseja ZERAR o sistema para cadastrar tudo do zero?\n\nDigite "ZERAR" para confirmar a limpeza total de agendamentos, despesas e serviços:'
    );
    if (confirmText === 'ZERAR') {
      setAppointments([]);
      setExpenses([]);
      setServices([]);
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);
      localStorage.setItem('belissima_appointments', JSON.stringify([]));
      localStorage.setItem('belissima_expenses', JSON.stringify([]));
      localStorage.setItem('belissima_services', JSON.stringify([]));
      localStorage.setItem('belissima_users', JSON.stringify(INITIAL_USERS));
      showToast('Sistema Belíssima zerado com sucesso! Pronto para cadastrar do zero.');
    }
  };

  // Load Suggested Template Services
  const handleLoadTemplateServices = () => {
    if (window.confirm('Deseja carregar as 18 sugestões de serviços para Cabelos, Sobrancelhas e Depilação?')) {
      setServices(SUGGESTED_SERVICES_TEMPLATE);
      showToast('Catálogo modelo de serviços carregado!');
    }
  };

  // Export / Import Backup JSON
  const exportBackup = () => {
    const data = {
      system: 'Belíssima',
      users,
      services,
      appointments,
      expenses,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `belissima-backup-${todayStr}.json`;
    a.click();
    showToast('Backup do Belíssima exportado!');
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.services && parsed.appointments) {
          setServices(parsed.services);
          setAppointments(parsed.appointments);
          if (parsed.users) setUsers(parsed.users);
          if (parsed.expenses) setExpenses(parsed.expenses);
          showToast('Backup do Belíssima restaurado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          background: 'var(--text-primary)',
          color: 'var(--text-inverse)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 999,
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }} className="fade-in">
          <Sparkles size={16} color="var(--gold-accent)" />
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <header className="top-header">
        <div className="header-container">
          <div className="brand-section">
            <div className="brand-icon-box">
              <Sparkles size={22} />
            </div>
            <div className="brand-titles">
              <h1>Belíssima</h1>
              <span className="brand-tagline">Salão Feminino • Gestão Enxuta</span>
            </div>
          </div>

          <div className="header-actions">
            {/* Active User Switcher Pill */}
            <div
              className="user-session-pill"
              onClick={() => setIsSwitchUserModalOpen(true)}
              title="Clique para alternar o usuário / operador"
            >
              <div className="user-avatar-sm">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-session-text">
                <span className="user-session-name">{currentUser?.name?.split(' ')[0]}</span>
                <span className="user-session-role">
                  {currentUser?.role === 'admin' ? '👑 Admin' : currentUser?.role === 'recepcao' ? '💼 Recepção' : '✂️ Profissional'}
                </span>
              </div>
            </div>

            {/* Quick Date Selector */}
            <div className="date-selector-wrapper">
              <Calendar size={15} color="var(--rose-500)" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Dark/Light Mode */}
            <button className="btn-icon" onClick={toggleTheme} title="Alternar Modo Claro / Escuro">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* New Appointment Button */}
            <button
              className="btn-primary"
              onClick={() => {
                setEditingAppointment(null);
                setIsAppointmentModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Nav Tabs Bar */}
      <nav className="nav-tabs-bar">
        <div className="nav-tabs-container">
          <button
            className={`tab-btn ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            <Calendar size={18} />
            <span>Agenda & Atendimentos</span>
            {filteredAppointments.length > 0 && <span className="tab-badge">{filteredAppointments.length}</span>}
          </button>

          <button
            className={`tab-btn ${activeTab === 'caixa' ? 'active' : ''}`}
            onClick={() => setActiveTab('caixa')}
          >
            <Receipt size={18} />
            <span>Caixa & Comandas</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'servicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('servicos')}
          >
            <Scissors size={18} />
            <span>Serviços & Preços</span>
            {services.length > 0 && <span className="tab-badge">{services.length}</span>}
          </button>

          <button
            className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            <Users size={18} />
            <span>Clientes & Fidelidade</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'equipe' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipe')}
          >
            <ShieldCheck size={18} />
            <span>Controle de Usuários</span>
            <span className="tab-badge">{users.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'financeiro' ? 'active' : ''}`}
            onClick={() => setActiveTab('financeiro')}
          >
            <TrendingUp size={18} />
            <span>Financeiro & Config</span>
          </button>
        </div>
      </nav>

      {/* Main Body Content */}
      <main className="main-content">
        {/* Quick Day Metrics Bar (Shown on Agenda and Caixa) */}
        {(activeTab === 'agenda' || activeTab === 'caixa') && (
          <div className="stats-grid fade-in">
            <div className="stat-card">
              <div className="stat-icon">
                <DollarSign size={22} />
              </div>
              <div className="stat-info">
                <p>Faturamento do Dia</p>
                <h3>R$ {dailyStats.totalRevenue.toFixed(2).replace('.', ',')}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#b84d38', background: '#fce7e3' }}>
                <Clock size={22} />
              </div>
              <div className="stat-info">
                <p>Na Cadeira Agora</p>
                <h3>{dailyStats.inServiceCount} atendimento(s)</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#825f16', background: '#f4ebd0' }}>
                <Calendar size={22} />
              </div>
              <div className="stat-info">
                <p>Aguardando Horário</p>
                <h3>{dailyStats.pendingCount} agendado(s)</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#1b7440', background: '#e2f4ea' }}>
                <CheckCircle2 size={22} />
              </div>
              <div className="stat-info">
                <p>Finalizados Hoje</p>
                <h3>{dailyStats.completedCount} cliente(s)</h3>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: AGENDA & ATENDIMENTOS */}
        {activeTab === 'agenda' && (
          <section className="fade-in">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>Agenda do Dia — Belíssima</h2>
                <p>Gerencie horários, inicie atendimentos e envie confirmações de WhatsApp com 1 toque.</p>
              </div>

              {/* Status Filters */}
              <div className="filter-pills-bar">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'agendado', label: 'Agendados' },
                  { id: 'atendendo', label: 'Na Cadeira' },
                  { id: 'concluido', label: 'Concluídos' }
                ].map(f => (
                  <button
                    key={f.id}
                    className={`filter-pill ${statusFilter === f.id ? 'active' : ''}`}
                    onClick={() => setStatusFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Appointments */}
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <h3>Nenhum agendamento para esta data</h3>
                <p>O sistema está zerado e pronto para os novos atendimentos do salão!</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingAppointment(null);
                    setIsAppointmentModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Novo Agendamento
                </button>
              </div>
            ) : (
              <div className="appointments-grid">
                {filteredAppointments.map(apt => {
                  const staffMember = users.find(u => u.id === apt.staffId);
                  const aptServices = apt.serviceIds
                    .map(id => services.find(s => s.id === id))
                    .filter(Boolean);

                  const totalEstimated = aptServices.reduce((sum, s) => sum + s.price, 0);

                  return (
                    <article key={apt.id} className="appointment-card fade-in">
                      <div>
                        <div className="card-top">
                          <div className="time-slot">
                            <Clock size={18} />
                            <span>{apt.time}</span>
                          </div>
                          <span className={`status-badge status-${apt.status}`}>
                            {apt.status === 'atendendo' ? 'Na Cadeira' : apt.status}
                          </span>
                        </div>

                        <h3 className="client-name">
                          <UserCheck size={18} color="var(--rose-500)" />
                          {apt.clientName}
                        </h3>

                        <div className="client-phone">
                          <Phone size={14} />
                          <span>{apt.clientPhone}</span>
                        </div>

                        {/* Services Badges */}
                        <div className="services-list">
                          {aptServices.map(s => (
                            <span key={s.id} className={`service-tag tag-${s.category}`}>
                              {s.name} (R$ {s.price})
                            </span>
                          ))}
                        </div>

                        {staffMember && (
                          <div className="staff-info">
                            <Scissors size={14} color="var(--rose-400)" />
                            <span>Profissional: <strong>{staffMember.name}</strong></span>
                          </div>
                        )}

                        {apt.notes && (
                          <div className="notes-box">
                            "{apt.notes}"
                          </div>
                        )}
                      </div>

                      <div className="card-footer">
                        <div className="price-estimate">
                          R$ {totalEstimated.toFixed(2).replace('.', ',')}
                        </div>

                        <div className="card-actions-row">
                          <button
                            className="btn-whatsapp"
                            onClick={() => sendWhatsApp(apt)}
                            title="Enviar confirmação no WhatsApp"
                          >
                            <MessageCircle size={15} />
                            <span>Avisar</span>
                          </button>

                          {apt.status === 'agendado' && (
                            <button
                              className="btn-start"
                              onClick={() => handleStartService(apt.id)}
                            >
                              <Scissors size={15} />
                              <span>Atender</span>
                            </button>
                          )}

                          {apt.status === 'atendendo' && (
                            <button
                              className="btn-checkout"
                              onClick={() => handleOpenCheckout(apt)}
                            >
                              <DollarSign size={15} />
                              <span>Fechar Comanda</span>
                            </button>
                          )}

                          {apt.status === 'concluido' && (
                            <span style={{ fontSize: '0.8rem', color: '#1b7440', fontWeight: '600' }}>
                              ✓ Pago ({apt.payment?.method?.toUpperCase()})
                            </span>
                          )}

                          <button
                            className="btn-icon"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => {
                              setEditingAppointment(apt);
                              setIsAppointmentModalOpen(true);
                            }}
                            title="Editar agendamento"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            className="btn-icon"
                            style={{ width: '34px', height: '34px', color: '#dc2626' }}
                            onClick={() => handleDeleteAppointment(apt.id)}
                            title="Excluir agendamento"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: CAIXA & COMANDAS */}
        {activeTab === 'caixa' && (
          <section className="fade-in">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>Caixa & Comandas do Dia</h2>
                <p>Controle de recebimentos, pagamentos e fechamento rápido.</p>
              </div>

              <button
                className="btn-secondary"
                onClick={() => {
                  setEditingAppointment({
                    id: `apt-${Date.now()}`,
                    date: selectedDate,
                    time: '12:00',
                    clientName: '',
                    clientPhone: '',
                    serviceIds: [],
                    staffId: users[0]?.id || 'usr-1',
                    status: 'atendendo',
                    notes: 'Atendimento Avulso de Balcão'
                  });
                  setIsAppointmentModalOpen(true);
                }}
              >
                <Plus size={16} /> Atendimento Avulso / Balcão
              </button>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Comandas Pagas ({selectedDate.split('-').reverse().join('/')})</h3>
                <span style={{ fontWeight: '700', color: 'var(--rose-600)', fontSize: '1.15rem' }}>
                  Total: R$ {dailyStats.totalRevenue.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--rose-50)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '0.75rem 1.25rem' }}>Horário</th>
                      <th style={{ padding: '0.75rem 1.25rem' }}>Cliente</th>
                      <th style={{ padding: '0.75rem 1.25rem' }}>Serviços Realizados</th>
                      <th style={{ padding: '0.75rem 1.25rem' }}>Profissional</th>
                      <th style={{ padding: '0.75rem 1.25rem' }}>Pagamento</th>
                      <th style={{ padding: '0.75rem 1.25rem' }}>Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .filter(a => a.date === selectedDate && a.status === 'concluido' && a.payment)
                      .map(apt => {
                        const st = users.find(u => u.id === apt.staffId);
                        const sNames = apt.serviceIds.map(id => services.find(x => x.id === id)?.name).filter(Boolean).join(', ');
                        return (
                          <tr key={apt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600' }}>{apt.time}</td>
                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700' }}>{apt.clientName}</td>
                            <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>{sNames}</td>
                            <td style={{ padding: '0.85rem 1.25rem' }}>{st?.name || 'Geral'}</td>
                            <td style={{ padding: '0.85rem 1.25rem' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: 'var(--cat-cabelo-bg)',
                                color: 'var(--rose-600)',
                                textTransform: 'uppercase'
                              }}>
                                {apt.payment?.method}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#1b7440' }}>
                              R$ {apt.payment?.total?.toFixed(2).replace('.', ',')}
                            </td>
                          </tr>
                        );
                      })}
                    {appointments.filter(a => a.date === selectedDate && a.status === 'concluido' && a.payment).length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Nenhuma comanda fechada para a data selecionada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: SERVIÇOS & PREÇOS */}
        {activeTab === 'servicos' && (
          <section className="fade-in">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>Catálogo de Serviços Especializados</h2>
                <p>Cardápio focado em Cabelo Feminino, Sobrancelhas e Depilação.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {services.length === 0 && (
                  <button className="btn-secondary" onClick={handleLoadTemplateServices}>
                    <Sparkle size={16} color="var(--gold-accent)" />
                    <span>Carregar Sugestões Prontas</span>
                  </button>
                )}
                <button className="btn-primary" onClick={() => setIsServiceModalOpen(true)}>
                  <Plus size={16} /> Novo Serviço
                </button>
              </div>
            </div>

            {services.length === 0 ? (
              <div className="empty-state">
                <Scissors size={48} />
                <h3>Nenhum serviço cadastrado ainda</h3>
                <p>O catálogo está zerado. Você pode cadastrar seus serviços personalizados ou carregar a lista de sugestões com 1 clique.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => setIsServiceModalOpen(true)}>
                    <Plus size={16} /> Cadastrar Meu Primeiro Serviço
                  </button>
                  <button className="btn-secondary" onClick={handleLoadTemplateServices}>
                    <Sparkles size={16} /> Puxar Sugestões Prontas
                  </button>
                </div>
              </div>
            ) : (
              ['cabelo', 'sobrancelhas', 'depilacao'].map(categoryKey => {
                const catTitle =
                  categoryKey === 'cabelo'
                    ? '✂️ Cabelo Feminino (Cortes, Mechas, Escovas & Tratamentos)'
                    : categoryKey === 'sobrancelhas'
                    ? '✨ Sobrancelhas & Olhar (Design, Henna, Lamination & Micro)'
                    : '🌸 Depilação Feminina (Cera Hipoalergênica & Conforto)';

                const catServices = services.filter(s => s.category === categoryKey);
                if (catServices.length === 0) return null;

                return (
                  <div key={categoryKey} style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.25rem',
                      marginBottom: '0.85rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {catTitle} ({catServices.length})
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                      {catServices.map(s => (
                        <div
                          key={s.id}
                          style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.15rem',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.75rem'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{s.name}</h4>
                              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--rose-600)', whiteSpace: 'nowrap' }}>
                                R$ {s.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                              {s.description}
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={13} /> {s.duration} min
                            </span>
                            <button
                              style={{ color: '#dc2626' }}
                              onClick={() => {
                                if (window.confirm(`Deseja remover o serviço "${s.name}"?`)) {
                                  setServices(prev => prev.filter(item => item.id !== s.id));
                                  showToast('Serviço removido.');
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}

        {/* TAB 4: CLIENTES & FIDELIDADE */}
        {activeTab === 'clientes' && (
          <section className="fade-in">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>Clientes & Histórico de Visitas</h2>
                <p>Controle automático de visitas e atalho para reconexão no WhatsApp.</p>
              </div>

              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {clientsList.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>Nenhuma cliente registrada ainda</h3>
                <p>Ao criar agendamentos, o Belíssima cadastra e contabiliza as clientes automaticamente!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {clientsList.map(c => {
                  const sendClientReturnMsg = () => {
                    const text = encodeURIComponent(
                      `Olá, ${c.name}! 💕 Como estão seus cuidados? Passando para lembrar que estamos com horários abertos esta semana no *Belíssima*. Quer aproveitar para renovar seu visual? ✨`
                    );
                    const clean = c.phone.replace(/\D/g, '');
                    const full = clean.startsWith('55') ? clean : `55${clean}`;
                    window.open(`https://api.whatsapp.com/send?phone=${full}&text=${text}`, '_blank');
                  };

                  return (
                    <div
                      key={c.phone}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{c.name}</h3>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.phone}</p>
                        </div>
                        <button
                          className="btn-whatsapp"
                          onClick={sendClientReturnMsg}
                          title="Mandar mensagem de retorno"
                        >
                          <MessageCircle size={14} /> Chamar
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', background: 'var(--rose-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.85rem' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>VISITAS</span>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{c.totalVisits} vez(es)</strong>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL GASTO</span>
                          <strong style={{ fontSize: '0.95rem', color: '#1b7440' }}>R$ {c.totalSpent.toFixed(2).replace('.', ',')}</strong>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Serviços Realizados:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {c.servicesDone.slice(0, 3).map((sn, idx) => (
                            <span key={idx} style={{ fontSize: '0.72rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                              {sn}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 5: CONTROLE DE USUÁRIOS & EQUIPE */}
        {activeTab === 'equipe' && (
          <section className="fade-in">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>Controle de Usuários & Equipe</h2>
                <p>Gerencie quem tem acesso ao sistema, perfis de permissão e comissões.</p>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  setEditingUser(null);
                  setIsUserModalOpen(true);
                }}
              >
                <UserPlus size={16} /> Novo Usuário
              </button>
            </div>

            <div className="users-grid">
              {users.map(user => {
                const isCurrentActive = currentUser?.id === user.id;

                const roleLabel =
                  user.role === 'admin'
                    ? '👑 Administradora / Proprietária'
                    : user.role === 'recepcao'
                    ? '💼 Recepção & Caixa'
                    : '✂️ Profissional / Atendente';

                const roleClass = `role-${user.role}`;

                return (
                  <article key={user.id} className="user-card">
                    <div>
                      <div className="user-card-header">
                        <div className="user-card-profile">
                          <div className="user-avatar-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{user.name}</h3>
                            <span className={`role-badge ${roleClass}`}>{roleLabel}</span>
                          </div>
                        </div>

                        {isCurrentActive && (
                          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1b7440', background: '#e2f4ea', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                            ● Sessão Ativa
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {user.email && <div><strong>Login/E-mail:</strong> {user.email}</div>}
                        {user.phone && <div><strong>WhatsApp:</strong> {user.phone}</div>}
                        <div><strong>Comissão:</strong> {user.commission}% sobre serviços</div>
                        <div><strong>Status:</strong> <span style={{ color: user.status === 'ativo' ? '#1b7440' : '#dc2626', fontWeight: '600' }}>{user.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></div>
                      </div>

                      {user.specialties && user.specialties.length > 0 && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Especialidades:</span>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {user.specialties.map(sp => (
                              <span key={sp} className={`service-tag tag-${sp}`}>
                                {sp.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                      <button
                        className="btn-secondary"
                        style={{ minHeight: '34px', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                        onClick={() => {
                          setCurrentUser(user);
                          showToast(`Sessão alternada para ${user.name}!`);
                        }}
                      >
                        {isCurrentActive ? 'Usuário Atual' : 'Usar Esta Conta'}
                      </button>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn-icon"
                          style={{ width: '34px', height: '34px' }}
                          onClick={() => {
                            setEditingUser(user);
                            setIsUserModalOpen(true);
                          }}
                          title="Editar Usuário"
                        >
                          <Edit3 size={14} />
                        </button>

                        {users.length > 1 && (
                          <button
                            className="btn-icon"
                            style={{ width: '34px', height: '34px', color: '#dc2626' }}
                            onClick={() => {
                              if (window.confirm(`Deseja remover o usuário ${user.name}?`)) {
                                setUsers(prev => prev.filter(u => u.id !== user.id));
                                if (currentUser?.id === user.id) {
                                  setCurrentUser(users.find(u => u.id !== user.id));
                                }
                                showToast('Usuário removido.');
                              }
                            }}
                            title="Remover Usuário"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 6: FINANCEIRO & CONFIG */}
        {activeTab === 'financeiro' && (
          <section className="fade-in">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>Financeiro & Governança — Belíssima</h2>
                <p>Controle de gastos rápidos, segurança de dados e reset do sistema.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => setIsExpenseModalOpen(true)}>
                  <Plus size={16} /> Nova Despesa
                </button>
                <button className="btn-secondary" onClick={exportBackup}>
                  <Download size={16} /> Exportar Backup (JSON)
                </button>
                <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> Importar Backup
                  <input type="file" accept=".json" onChange={importBackup} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Quick Actions & Reset Zone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Reset to Zero Card */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid #fca5a5', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', marginBottom: '0.5rem' }}>
                  <RefreshCw size={20} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Zerar Sistema do Salão</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Limpa todos os agendamentos, clientes e despesas para iniciar um novo período ou começar os lançamentos 100% do zero.
                </p>
                <button className="btn-danger" onClick={handleResetSystemToZero}>
                  <Trash2 size={16} /> Zerar Dados para Iniciar do Zero
                </button>
              </div>

              {/* Template Services Card */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rose-600)', marginBottom: '0.5rem' }}>
                  <Sparkles size={20} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Sugestões de Serviços</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Carregue a qualquer momento a lista pré-configurada de cabelos, sobrancelhas e depilação para economizar tempo de digitação.
                </p>
                <button className="btn-secondary" onClick={handleLoadTemplateServices}>
                  <Sparkles size={16} color="var(--gold-accent)" /> Carregar 18 Serviços Sugeridos
                </button>
              </div>
            </div>

            {/* Expenses List */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>Despesas Operacionais Recentes</h3>
              {expenses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Nenhuma despesa registrada.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {expenses.map(exp => (
                    <div
                      key={exp.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <strong>{exp.description}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{exp.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: '700', color: '#dc2626' }}>
                          - R$ {exp.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          style={{ color: '#dc2626' }}
                          onClick={() => {
                            setExpenses(prev => prev.filter(x => x.id !== exp.id));
                            showToast('Despesa removida.');
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Mobile First) */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-nav-items">
          <button
            className={`mobile-nav-btn ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            <Calendar size={20} />
            <span>Agenda</span>
            {filteredAppointments.length > 0 && (
              <span className="mobile-nav-badge">{filteredAppointments.length}</span>
            )}
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'caixa' ? 'active' : ''}`}
            onClick={() => setActiveTab('caixa')}
          >
            <Receipt size={20} />
            <span>Caixa</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'servicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('servicos')}
          >
            <Scissors size={20} />
            <span>Serviços</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            <Users size={20} />
            <span>Clientes</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'equipe' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipe')}
          >
            <ShieldCheck size={20} />
            <span>Usuários</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'financeiro' ? 'active' : ''}`}
            onClick={() => setActiveTab('financeiro')}
          >
            <TrendingUp size={20} />
            <span>Finanças</span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          MODAL: NOVO / EDITAR AGENDAMENTO
          ========================================================================= */}
      {isAppointmentModalOpen && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          initialData={editingAppointment}
          services={services}
          staff={users}
          defaultDate={selectedDate}
          onClose={() => setIsAppointmentModalOpen(false)}
          onSave={(newApt) => {
            if (editingAppointment) {
              setAppointments(prev => prev.map(a => (a.id === newApt.id ? newApt : a)));
              showToast('Agendamento atualizado com sucesso!');
            } else {
              setAppointments(prev => [...prev, newApt]);
              showToast('Novo agendamento criado!');
            }
            setIsAppointmentModalOpen(false);
          }}
        />
      )}

      {/* =========================================================================
          MODAL: FECHAR COMANDA / CHECKOUT COM CONFETTI
          ========================================================================= */}
      {isCheckoutModalOpen && checkoutAppointment && (
        <CheckoutModal
          appointment={checkoutAppointment}
          services={services}
          products={products}
          onClose={() => setIsCheckoutModalOpen(false)}
          onConfirm={(updatedApt) => {
            setAppointments(prev => prev.map(a => (a.id === updatedApt.id ? updatedApt : a)));
            setIsCheckoutModalOpen(false);
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
            showToast('Comanda fechada com sucesso! Pagamento registrado.');
          }}
        />
      )}

      {/* =========================================================================
          MODAL: NOVO SERVIÇO
          ========================================================================= */}
      {isServiceModalOpen && (
        <NewServiceModal
          onClose={() => setIsServiceModalOpen(false)}
          onSave={(newService) => {
            setServices(prev => [...prev, newService]);
            setIsServiceModalOpen(false);
            showToast('Serviço adicionado ao catálogo!');
          }}
        />
      )}

      {/* =========================================================================
          MODAL: NOVA DESPESA
          ========================================================================= */}
      {isExpenseModalOpen && (
        <NewExpenseModal
          defaultDate={selectedDate}
          onClose={() => setIsExpenseModalOpen(false)}
          onSave={(newExp) => {
            setExpenses(prev => [newExp, ...prev]);
            setIsExpenseModalOpen(false);
            showToast('Despesa registrada no caixa!');
          }}
        />
      )}

      {/* =========================================================================
          MODAL: NOVO / EDITAR USUÁRIO
          ========================================================================= */}
      {isUserModalOpen && (
        <UserModal
          initialData={editingUser}
          onClose={() => setIsUserModalOpen(false)}
          onSave={(savedUser) => {
            if (editingUser) {
              setUsers(prev => prev.map(u => (u.id === savedUser.id ? savedUser : u)));
              if (currentUser?.id === savedUser.id) {
                setCurrentUser(savedUser);
              }
              showToast('Usuário atualizado com sucesso!');
            } else {
              setUsers(prev => [...prev, savedUser]);
              showToast('Novo usuário cadastrado na equipe!');
            }
            setIsUserModalOpen(false);
          }}
        />
      )}

      {/* =========================================================================
          MODAL: ALTERNAR OPERADOR / USUÁRIO ATIVO
          ========================================================================= */}
      {isSwitchUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="sheet-handle"></div>
            <div className="modal-header">
              <h3>Alternar Usuário / Operador</h3>
              <button onClick={() => setIsSwitchUserModalOpen(false)} className="btn-icon" style={{ width: '34px', height: '34px' }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Selecione quem está operando o sistema agora no <strong>Belíssima</strong>:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {users.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setIsSwitchUserModalOpen(false);
                        showToast(`Sessão agora ativa com ${u.name}!`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isCurrent ? 'var(--rose-50)' : 'var(--bg-app)',
                        border: isCurrent ? '1.5px solid var(--rose-400)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar-sm" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.9rem', display: 'block' }}>{u.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--rose-500)', textTransform: 'uppercase' }}>
                            {u.role === 'admin' ? '👑 Administradora' : u.role === 'recepcao' ? '💼 Recepção' : '✂️ Profissional'}
                          </span>
                        </div>
                      </div>
                      {isCurrent && <Check size={18} color="var(--rose-500)" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsSwitchUserModalOpen(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUBCOMPONENT: APPOINTMENT MODAL
// =============================================================================
function AppointmentModal({ isOpen, initialData, services, staff, defaultDate, onClose, onSave }) {
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialData?.clientPhone || '');
  const [date, setDate] = useState(initialData?.date || defaultDate);
  const [time, setTime] = useState(initialData?.time || '10:00');
  const [staffId, setStaffId] = useState(initialData?.staffId || staff[0]?.id || '');
  const [serviceIds, setServiceIds] = useState(initialData?.serviceIds || []);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [activeCategory, setActiveCategory] = useState('cabelo');

  const toggleService = (id) => {
    setServiceIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const calculatedTotal = useMemo(() => {
    return serviceIds.reduce((sum, id) => {
      const s = services.find(x => x.id === id);
      return sum + (s?.price || 0);
    }, 0);
  }, [serviceIds, services]);

  const calculatedDuration = useMemo(() => {
    return serviceIds.reduce((sum, id) => {
      const s = services.find(x => x.id === id);
      return sum + (s?.duration || 0);
    }, 0);
  }, [serviceIds, services]);

  const getCategoryCount = (cat) => {
    return serviceIds.filter(id => {
      const s = services.find(x => x.id === id);
      return s?.category === cat;
    }).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor, informe o nome da cliente.');
      return;
    }
    if (serviceIds.length === 0) {
      alert('Selecione pelo menos um serviço.');
      return;
    }

    onSave({
      id: initialData?.id || `apt-${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '67999990000',
      date,
      time,
      staffId: staffId || staff[0]?.id,
      serviceIds,
      status: initialData?.status || 'agendado',
      notes,
      payment: initialData?.payment || null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="sheet-handle"></div>
        <div className="modal-header">
          <h3>{initialData ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nome Completo da Cliente *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Ana Clara Martins"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>WhatsApp (com DDD) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 67999887766"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Profissional Responsável</label>
                <select
                  className="form-select"
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Horário</label>
                <input
                  type="time"
                  className="form-input"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Compact, Highly Visible Services Section */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <label>Serviços Desejados</label>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--rose-600)' }}>
                  Total: R$ {calculatedTotal.toFixed(2).replace('.', ',')} ({calculatedDuration} min)
                </span>
              </div>

              {services.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-app)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Nenhum serviço no catálogo ainda. Vá na aba "Serviços" para cadastrar ou carregar as sugestões!
                  </p>
                </div>
              ) : (
                <div className="service-compact-section">
                  <div className="service-category-nav">
                    {[
                      { id: 'cabelo', label: '✂️ Cabelo' },
                      { id: 'sobrancelhas', label: '✨ Sobrancelhas' },
                      { id: 'depilacao', label: '🌸 Depilação' }
                    ].map(cat => {
                      const count = getCategoryCount(cat.id);
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          className={`category-tab-pill ${activeCategory === cat.id ? 'active' : ''}`}
                          onClick={() => setActiveCategory(cat.id)}
                        >
                          <span>{cat.label}</span>
                          {count > 0 && <span className="pill-counter">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="service-clean-list">
                    {services
                      .filter(s => s.category === activeCategory)
                      .map(s => {
                        const isSelected = serviceIds.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            className={`service-clean-row ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleService(s.id)}
                          >
                            <div className="service-row-left">
                              <div className="service-custom-checkbox">
                                {isSelected && <Check size={13} strokeWidth={3} />}
                              </div>
                              <span className="service-name-text">{s.name}</span>
                            </div>
                            <span className="service-price-pill">
                              R$ {s.price} • {s.duration}m
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  {serviceIds.length > 0 && (
                    <div className="selected-summary-bar">
                      <span>
                        ✨ <strong>{serviceIds.length}</strong> selecionado(s)
                      </span>
                      <strong>R$ {calculatedTotal.toFixed(2).replace('.', ',')}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Observações / Preferências da Cliente</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Ex: Cabelo descolorido recentemente, pele sensível, prefere café com leite..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">
              <Check size={16} /> Salvar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// SUBCOMPONENT: CHECKOUT MODAL
// =============================================================================
function CheckoutModal({ appointment, services, products, onClose, onConfirm }) {
  const [selectedServices, setSelectedServices] = useState(appointment.serviceIds);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [amountReceived, setAmountReceived] = useState('');

  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((sum, id) => {
      const s = services.find(x => x.id === id);
      return sum + (s?.price || 0);
    }, 0);
  }, [selectedServices, services]);

  const productsTotal = useMemo(() => {
    return selectedProducts.reduce((sum, item) => sum + item.price, 0);
  }, [selectedProducts]);

  const finalTotal = Math.max(0, servicesTotal + productsTotal - Number(discount || 0));

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'dinheiro') return 0;
    const rec = Number(amountReceived || 0);
    return Math.max(0, rec - finalTotal);
  }, [paymentMethod, amountReceived, finalTotal]);

  const handleFinish = () => {
    onConfirm({
      ...appointment,
      status: 'concluido',
      serviceIds: selectedServices,
      payment: {
        method: paymentMethod,
        servicesTotal,
        productsTotal,
        discount: Number(discount || 0),
        total: finalTotal,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="sheet-handle"></div>
        <div className="modal-header">
          <div>
            <h3>Fechar Comanda & Receber</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Cliente: <strong>{appointment.clientName}</strong>
            </span>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Serviços Realizados:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {selectedServices.map(id => {
                const s = services.find(x => x.id === id);
                if (!s) return null;
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--rose-50)', borderRadius: '8px', fontSize: '0.88rem' }}>
                    <span>{s.name}</span>
                    <strong>R$ {s.price.toFixed(2).replace('.', ',')}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {products.length > 0 && (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Venda de Produto Home Care (Opcional):
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {products.map(p => {
                  const isAdded = selectedProducts.some(x => x.id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (isAdded) {
                          setSelectedProducts(prev => prev.filter(x => x.id !== p.id));
                        } else {
                          setSelectedProducts(prev => [...prev, p]);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: isAdded ? 'var(--rose-500)' : 'var(--bg-app)',
                        color: isAdded ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        minHeight: '38px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isAdded ? '✓ ' : '+ '} {p.name} (R$ {p.price})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Desconto Especial (R$)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0,00"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Forma de Pagamento</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="pix">📱 Pix Instantâneo</option>
                <option value="credito">💳 Cartão de Crédito</option>
                <option value="debito">💳 Cartão de Débito</option>
                <option value="dinheiro">💵 Dinheiro em Espécie</option>
              </select>
            </div>
          </div>

          {paymentMethod === 'dinheiro' && (
            <div style={{ background: 'var(--status-agendado-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <div className="form-group">
                <label style={{ color: '#825f16' }}>Valor Entregue pela Cliente:</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 200"
                  value={amountReceived}
                  onChange={e => setAmountReceived(e.target.value)}
                />
              </div>
              {Number(amountReceived) > finalTotal && (
                <p style={{ marginTop: '6px', fontWeight: '700', color: '#825f16' }}>
                  Troco a Devolver: R$ {changeDue.toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>
          )}

          <div style={{
            background: 'var(--rose-50)',
            border: '1.5px solid var(--rose-300)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Valor Total a Receber:
            </span>
            <h2 style={{ fontSize: '2rem', color: 'var(--rose-600)', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
              R$ {finalTotal.toFixed(2).replace('.', ',')}
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Pagamento via {paymentMethod.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={handleFinish}>
            <CheckCircle2 size={18} />
            <span>Confirmar Pagamento & Finalizar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUBCOMPONENT: USER / STAFF MODAL
// =============================================================================
function UserModal({ initialData, onClose, onSave }) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [role, setRole] = useState(initialData?.role || 'profissional');
  const [commission, setCommission] = useState(initialData?.commission ?? 50);
  const [specialties, setSpecialties] = useState(initialData?.specialties || ['cabelo']);
  const [status, setStatus] = useState(initialData?.status || 'ativo');

  const toggleSpecialty = (sp) => {
    setSpecialties(prev =>
      prev.includes(sp) ? prev.filter(x => x !== sp) : [...prev, sp]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do usuário.');
      return;
    }
    onSave({
      id: initialData?.id || `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      commission: Number(commission),
      specialties,
      status
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="sheet-handle"></div>
        <div className="modal-header">
          <h3>{initialData ? 'Editar Usuário / Equipe' : 'Cadastrar Novo Usuário'}</h3>
          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Beatriz Lima"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Perfil de Acesso *</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="admin">👑 Administradora / Proprietária (Acesso Total)</option>
                  <option value="profissional">✂️ Profissional / Atendente</option>
                  <option value="recepcao">💼 Recepção & Caixa</option>
                </select>
              </div>

              <div className="form-group">
                <label>Comissão Padrão (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 50"
                  value={commission}
                  onChange={e => setCommission(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>WhatsApp / Telefone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 67999887766"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>E-mail / Login</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Ex: beatriz@belissima.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Especialidades Atendidas</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {[
                  { id: 'cabelo', label: '✂️ Cabelo Feminino' },
                  { id: 'sobrancelhas', label: '✨ Sobrancelhas' },
                  { id: 'depilacao', label: '🌸 Depilação' }
                ].map(sp => {
                  const isChecked = specialties.includes(sp.id);
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => toggleSpecialty(sp.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: isChecked ? 'var(--rose-500)' : 'var(--bg-app)',
                        color: isChecked ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {isChecked ? '✓ ' : '+ '} {sp.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Status do Usuário</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="ativo">Ativo no Salão</option>
                <option value="inativo">Inativo / Afastado</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Usuário</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// SUBCOMPONENT: NEW SERVICE MODAL
// =============================================================================
function NewServiceModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('cabelo');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('45');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Informe o nome e o preço do serviço.');
      return;
    }
    onSave({
      id: `srv-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price),
      duration: Number(duration),
      description: description.trim() || 'Serviço profissional de alta qualidade.'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="sheet-handle"></div>
        <div className="modal-header">
          <h3>Novo Serviço no Catálogo</h3>
          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nome do Serviço *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Escova Orgânica Alinhada"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoria *</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="cabelo">✂️ Cabelo Feminino</option>
                  <option value="sobrancelhas">✨ Sobrancelhas & Olhar</option>
                  <option value="depilacao">🌸 Depilação Feminina</option>
                </select>
              </div>

              <div className="form-group">
                <label>Preço (R$) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 120"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Duração Estimada (minutos)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 45"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Descrição do Procedimento</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Breve descrição dos passos ou benefícios para a cliente..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Serviço</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// SUBCOMPONENT: NEW EXPENSE MODAL
// =============================================================================
function NewExpenseModal({ defaultDate, onClose, onSave }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(defaultDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    onSave({
      id: `exp-${Date.now()}`,
      date,
      description: description.trim(),
      amount: Number(amount)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="sheet-handle"></div>
        <div className="modal-header">
          <h3>Nova Despesa Operacional</h3>
          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Descrição do Gasto *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Compra de toalhas descartáveis, pó descolorante..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0,00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar Despesa</button>
          </div>
        </form>
      </div>
    </div>
  );
}
