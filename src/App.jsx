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
  ArrowRight,
  UserCheck,
  Check,
  X,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import {
  INITIAL_SERVICES,
  INITIAL_STAFF,
  INITIAL_APPOINTMENTS,
  INITIAL_PRODUCTS,
  INITIAL_EXPENSES
} from './data/initialData';
import './App.css';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('bella_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bella_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Main Entities State with LocalStorage
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('bella_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('bella_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('bella_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [products] = useState(INITIAL_PRODUCTS);
  const [staff] = useState(INITIAL_STAFF);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('bella_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('bella_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('bella_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Navigation
  const [activeTab, setActiveTab] = useState('agenda'); // 'agenda', 'caixa', 'servicos', 'clientes', 'financeiro'

  // Date Filter (defaults to today)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Status Filter in Agenda
  const [statusFilter, setStatusFilter] = useState('todos');

  // Search in Clients / Services
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutAppointment, setCheckoutAppointment] = useState(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Appointments for Selected Date
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
      `Olá, ${apt.clientName}! ✨ Tudo bem?\n\nPassando para confirmar seu horário no *Bella Studio & Co.*:\n📅 *Data:* ${dateFormatted} às *${apt.time}h*\n✂️ *Serviço(s):* ${serviceNames}\n\nPodemos confirmar? Qualquer dúvida ou se precisar ajustar, é só me avisar aqui. Te esperamos com muito carinho! 💕`
    );

    const cleanPhone = apt.clientPhone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://api.whatsapp.com/send?phone=${fullPhone}&text=${text}`, '_blank');
    showToast('Link do WhatsApp aberto com a mensagem pronta!');
  };

  // Quick Action: Start Service
  const handleStartService = (aptId) => {
    setAppointments(prev =>
      prev.map(a => (a.id === aptId ? { ...a, status: 'atendendo' } : a))
    );
    showToast('Atendimento iniciado! Cliente na cadeira.');
  };

  // Quick Action: Open Checkout Modal
  const handleOpenCheckout = (apt) => {
    setCheckoutAppointment(apt);
    setIsCheckoutModalOpen(true);
  };

  // Quick Action: Delete / Cancel Appointment
  const handleDeleteAppointment = (aptId) => {
    if (window.confirm('Tem certeza que deseja cancelar/remover este agendamento?')) {
      setAppointments(prev => prev.filter(a => a.id !== aptId));
      showToast('Agendamento removido.');
    }
  };

  // Export / Import Backup JSON
  const exportBackup = () => {
    const data = {
      services,
      appointments,
      expenses,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bella-studio-backup-${todayStr}.json`;
    a.click();
    showToast('Backup exportado com sucesso!');
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
          if (parsed.expenses) setExpenses(parsed.expenses);
          showToast('Backup restaurado com sucesso!');
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
          bottom: '24px',
          right: '24px',
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
              <Sparkles size={24} />
            </div>
            <div className="brand-titles">
              <h1>Bella Studio & Co.</h1>
              <span className="brand-tagline">Cabelo • Sobrancelhas • Depilação</span>
            </div>
          </div>

          <div className="header-actions">
            {/* Quick Date Selector */}
            <div className="date-selector-wrapper">
              <Calendar size={16} color="var(--rose-500)" />
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

      {/* Navigation Tabs (Merged & Lean) */}
      <nav className="nav-tabs-bar">
        <div className="nav-tabs-container">
          <button
            className={`tab-btn ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            <Calendar size={18} />
            <span>Agenda & Atendimentos</span>
            <span className="tab-badge">{filteredAppointments.length}</span>
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
          </button>

          <button
            className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            <Users size={18} />
            <span>Clientes & Fidelidade</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'financeiro' ? 'active' : ''}`}
            onClick={() => setActiveTab('financeiro')}
          >
            <TrendingUp size={18} />
            <span>Financeiro & Backup</span>
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
                <h2>Agenda do Dia</h2>
                <p>Gerencie horários, inicie atendimentos e envie lembretes no WhatsApp com 1 clique.</p>
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
                <h3>Nenhum agendamento para este filtro</h3>
                <p>Clique no botão abaixo para adicionar a primeira cliente do dia!</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingAppointment(null);
                    setIsAppointmentModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Adicionar Agendamento
                </button>
              </div>
            ) : (
              <div className="appointments-grid">
                {filteredAppointments.map(apt => {
                  const staffMember = staff.find(s => s.id === apt.staffId);
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
                          {/* WhatsApp Reminder */}
                          <button
                            className="btn-whatsapp"
                            onClick={() => sendWhatsApp(apt)}
                            title="Enviar confirmação no WhatsApp"
                          >
                            <MessageCircle size={15} />
                            <span>Avisar</span>
                          </button>

                          {/* Action according to Status */}
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

                          {/* Edit / Remove */}
                          <button
                            className="btn-icon"
                            style={{ width: '32px', height: '32px' }}
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
                            style={{ width: '32px', height: '32px', color: '#dc2626' }}
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
                <p>Controle de recebimentos, histórico de pagamentos e fechamento rápido.</p>
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
                    staffId: 'st-1',
                    status: 'atendendo',
                    notes: 'Atendimento Avulso de Balcão'
                  });
                  setIsAppointmentModalOpen(true);
                }}
              >
                <Plus size={16} /> Atendimento Avulso / Balcão
              </button>
            </div>

            {/* Comandas Realizadas */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Comandas Pagas Hoje ({selectedDate.split('-').reverse().join('/')})</h3>
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
                        const st = staff.find(s => s.id === apt.staffId);
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
                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Nenhuma comanda fechada para a data selecionada ainda.
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
                <p>Cardápio enxuto focado exclusivamente em Cabelo Feminino, Sobrancelhas e Depilação.</p>
              </div>

              <button
                className="btn-primary"
                onClick={() => setIsServiceModalOpen(true)}
              >
                <Plus size={16} /> Novo Serviço
              </button>
            </div>

            {/* Categorized Services List */}
            {['cabelo', 'sobrancelhas', 'depilacao'].map(categoryKey => {
              const catTitle =
                categoryKey === 'cabelo'
                  ? '✂️ Cabelo Feminino (Cortes, Mechas, Escovas & Tratamentos)'
                  : categoryKey === 'sobrancelhas'
                  ? '✨ Sobrancelhas & Olhar (Design, Henna, Lamination & Micro)'
                  : '🌸 Depilação Feminina (Cera Hipoalergênica & Conforto)';

              const catServices = services.filter(s => s.category === categoryKey);

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
                    {catTitle}
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
                            <Clock size={13} /> Duração média: {s.duration} min
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
            })}
          </section>
        )}

        {/* TAB 4: CLIENTES & FIDELIDADE */}
        {activeTab === 'clientes' && (
          <section className="fade-in">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>Clientes & Fidelidade</h2>
                <p>Histórico rápido de visitas, valores investidos e atalho direto para reconectar no WhatsApp.</p>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar cliente por nome ou WhatsApp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {clientsList.map(c => {
                const sendClientReturnMsg = () => {
                  const text = encodeURIComponent(
                    `Olá, ${c.name}! 💕 Como estão seus cuidados? Passando para lembrar que estamos com horários especiais esta semana no *Bella Studio & Co.* Quer aproveitar para renovar seu visual? ✨`
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
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Serviços Favoritos:</span>
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
          </section>
        )}

        {/* TAB 5: FINANCEIRO & BACKUP */}
        {activeTab === 'financeiro' && (
          <section className="fade-in">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>Financeiro & Governança do Salão</h2>
                <p>Controle simplificado de entradas, saídas rápidas e segurança de dados.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          staff={staff}
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
            // Trigger celebration confetti
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
    </div>
  );
}

// =============================================================================
// SUBCOMPONENT: APPOINTMENT MODAL (MOBILE-FIRST & COMPACT VISIBLE SELECTOR)
// =============================================================================
function AppointmentModal({ isOpen, initialData, services, staff, defaultDate, onClose, onSave }) {
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialData?.clientPhone || '');
  const [date, setDate] = useState(initialData?.date || defaultDate);
  const [time, setTime] = useState(initialData?.time || '10:00');
  const [staffId, setStaffId] = useState(initialData?.staffId || staff[0]?.id);
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
      staffId,
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
                <label>Profissional</label>
                <select
                  className="form-select"
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role.split('&')[0].trim()})</option>
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

              <div className="service-compact-section">
                {/* Category Navigation Pills */}
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

                {/* Clean, Full-Width, Non-Truncated List */}
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

                {/* Selected Summary Bar */}
                {serviceIds.length > 0 && (
                  <div className="selected-summary-bar">
                    <span>
                      ✨ <strong>{serviceIds.length}</strong> selecionado(s)
                    </span>
                    <strong>R$ {calculatedTotal.toFixed(2).replace('.', ',')}</strong>
                  </div>
                )}
              </div>
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
// SUBCOMPONENT: CHECKOUT MODAL (FECHAR COMANDA - MOBILE FIRST)
// =============================================================================
function CheckoutModal({ appointment, services, products, onClose, onConfirm }) {
  const [selectedServices, setSelectedServices] = useState(appointment.serviceIds);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pix'); // pix, credito, debito, dinheiro
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
          {/* Services in Comanda */}
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

          {/* Quick Add Product */}
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

          {/* Discount Field */}
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

          {/* Cash Change Calculation */}
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

          {/* Summary Box */}
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
        <div className="modal-header">
          <h3>Novo Serviço no Catálogo</h3>
          <button onClick={onClose}><X size={20} /></button>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
        <div className="modal-header">
          <h3>Nova Despesa Operacional</h3>
          <button onClick={onClose}><X size={20} /></button>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
