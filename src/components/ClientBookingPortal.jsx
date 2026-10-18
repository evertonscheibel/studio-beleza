import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  User,
  ShieldCheck,
  Check,
  ChevronRight,
  ArrowLeft,
  Lock,
  Cake,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ClientBookingPortal({
  services,
  staff,
  appointments,
  onBookingCreated,
  onExitPortal
}) {
  const [step, setStep] = useState(1); // 1: Serviços, 2: Profissional & Horário, 3: Dados & Validação, 4: Concluído
  const [activeCategory, setActiveCategory] = useState('cabelo');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('qualquer'); // 'qualquer' ou staff.id

  // Data e Horário
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('');

  // Dados da Cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Validação Anti-Trotes / Anti-Fake
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [validationError, setValidationError] = useState('');
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // Toggle serviço
  const toggleService = (id) => {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Cálculo de total e duração estimada
  const totalAmount = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const s = services.find(x => x.id === id);
      return sum + (s?.price || 0);
    }, 0);
  }, [selectedServiceIds, services]);

  const totalDuration = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const s = services.find(x => x.id === id);
      return sum + (s?.duration || 0);
    }, 0);
  }, [selectedServiceIds, services]);

  // Horários disponíveis
  const availableSlots = useMemo(() => {
    const slots = [
      '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    // Checa horários ocupados nessa data
    const busyTimes = appointments
      .filter(a => a.date === selectedDate && a.status !== 'cancelado')
      .map(a => a.time);

    return slots.map(time => ({
      time,
      isAvailable: !busyTimes.includes(time)
    }));
  }, [selectedDate, appointments]);

  // Submissão com Validação de Segurança Anti-Fraude
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setValidationError('');

    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setValidationError('Por favor, informe um número de WhatsApp válido com DDD (Ex: 67 99988-7766).');
      return;
    }

    if (clientName.trim().length < 3) {
      setValidationError('Por favor, informe seu nome completo.');
      return;
    }

    // Anti-Spam: Verifica se o mesmo telefone fez agendamento nos últimos 15 minutos
    const lastBookingTime = localStorage.getItem(`belissima_last_booking_${cleanPhone}`);
    if (lastBookingTime) {
      const diffMs = Date.now() - parseInt(lastBookingTime, 10);
      if (diffMs < 15 * 60 * 1000) {
        setValidationError('Aguarde alguns minutos antes de solicitar um novo agendamento com este número.');
        return;
      }
    }

    // Checa código de validação se digitado
    if (verificationCode && verificationCode.trim() !== generatedCode) {
      setValidationError('Código de segurança incorreto. Digite os 4 dígitos exibidos na tela.');
      return;
    }

    // Define profissional
    let assignedStaffId = selectedStaffId;
    if (assignedStaffId === 'qualquer') {
      assignedStaffId = staff[0]?.id || 'usr-1';
    }

    const bookingId = `apt-online-${Date.now()}`;
    const token = `BEL-${generatedCode}`;

    const newApt = {
      id: bookingId,
      token,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      date: selectedDate,
      time: selectedTime,
      staffId: assignedStaffId,
      serviceIds: selectedServiceIds,
      status: 'pendente_online', // Status seguro: aguarda aprovação da recepção
      origin: 'portal_cliente',
      notes: clientNotes ? `[Agendado Online • Token ${token}] ${clientNotes}` : `[Agendado Online • Token ${token}]`,
      createdAt: new Date().toISOString()
    };

    // Salva timestamp anti-spam
    localStorage.setItem(`belissima_last_booking_${cleanPhone}`, Date.now().toString());

    onBookingCreated(newApt);
    setConfirmedBookingData(newApt);
    setStep(4);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Abre WhatsApp com o comprovante e código de segurança
  const handleOpenSalonWhatsApp = () => {
    if (!confirmedBookingData) return;
    const serviceNames = selectedServiceIds
      .map(id => services.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const dateFormatted = confirmedBookingData.date.split('-').reverse().join('/');
    const text = encodeURIComponent(
      `Olá, Belíssima! 💕 Acabei de solicitar meu agendamento pelo site e gostaria de confirmar:\n\n` +
      `🎟️ *Código de Confirmação:* #${confirmedBookingData.token}\n` +
      `👤 *Nome:* ${confirmedBookingData.clientName}\n` +
      `📅 *Data:* ${dateFormatted} às *${confirmedBookingData.time}h*\n` +
      `✂️ *Serviço(s):* ${serviceNames}\n` +
      `💰 *Valor Estimado:* R$ ${totalAmount.toFixed(2).replace('.', ',')}\n\n` +
      `Aguardo a confirmação de vocês! Muito obrigada! ✨`
    );

    // Abre WhatsApp do salão ou contato
    window.open(`https://api.whatsapp.com/send?phone=5567999887766&text=${text}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Público */}
      <header
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 1.25rem',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backdropFilter: 'blur(12px)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--militar-500), var(--militar-700))',
                border: '1.5px solid var(--gold-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-300)'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: '700', margin: 0, lineHeight: 1.1 }}>
                Belíssima
              </h1>
              <span style={{ fontSize: '0.7rem', color: 'var(--gold-600)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                Autoagendamento Exclusivo
              </span>
            </div>
          </div>

          <button
            onClick={onExitPortal}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
            title="Voltar ao Painel Administrativo"
          >
            <Lock size={12} /> Área da Equipe
          </button>
        </div>
      </header>

      {/* Conteúdo Principal do Autoagendamento */}
      <main style={{ maxWidth: '680px', width: '100%', margin: '0 auto', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Barra de Progresso Elegante */}
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: step >= 1 ? 'var(--militar-700)' : 'var(--text-muted)', fontWeight: step === 1 ? '700' : '500', fontSize: '0.8rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 1 ? 'var(--militar-600)' : 'var(--border-subtle)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>1</span>
              <span>Procedimentos</span>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: step >= 2 ? 'var(--militar-700)' : 'var(--text-muted)', fontWeight: step === 2 ? '700' : '500', fontSize: '0.8rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 2 ? 'var(--militar-600)' : 'var(--border-subtle)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>2</span>
              <span>Horário</span>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: step >= 3 ? 'var(--militar-700)' : 'var(--text-muted)', fontWeight: step === 3 ? '700' : '500', fontSize: '0.8rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 3 ? 'var(--militar-600)' : 'var(--border-subtle)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>3</span>
              <span>Confirmação</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 1: ESCOLHA DOS PROCEDIMENTOS
            ========================================================================= */}
        {step === 1 && (
          <div className="fade-in">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Escolha seu Momento de Beleza ✨
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Selecione os procedimentos que deseja realizar no Belíssima:
              </p>
            </div>

            {/* Categorias: Cabelo, Sobrancelhas, Depilação */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                className={`tab-btn ${activeCategory === 'cabelo' ? 'active' : ''}`}
                onClick={() => setActiveCategory('cabelo')}
                style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
              >
                <Scissors size={14} /> Cabelo Feminino
              </button>
              <button
                className={`tab-btn ${activeCategory === 'sobrancelhas' ? 'active' : ''}`}
                onClick={() => setActiveCategory('sobrancelhas')}
                style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
              >
                <Sparkles size={14} /> Sobrancelhas & Cílios
              </button>
              <button
                className={`tab-btn ${activeCategory === 'depilacao' ? 'active' : ''}`}
                onClick={() => setActiveCategory('depilacao')}
                style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
              >
                <Heart size={14} /> Depilação Feminina
              </button>
            </div>

            {/* Lista de Serviços */}
            {services.filter(s => s.category === activeCategory).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <Scissors size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Nenhum serviço disponível nesta categoria no momento.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {services
                  .filter(s => s.category === activeCategory)
                  .map(s => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        style={{
                          background: isSelected ? 'var(--rose-50)' : 'var(--bg-card)',
                          border: isSelected ? '1.5px solid var(--gold-400)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem 1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{s.name}</strong>
                          </div>
                          {s.description && (
                            <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                              {s.description}
                            </p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={12} /> {s.duration} min
                            </span>
                            <span style={{ color: 'var(--militar-700)', fontWeight: '700', fontSize: '0.88rem' }}>
                              R$ {s.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: isSelected ? 'var(--militar-600)' : 'transparent',
                            border: isSelected ? 'none' : '1.5px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={16} />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Sticky Bottom Bar com Resumo do Pedido */}
            <div
              style={{
                position: 'sticky',
                bottom: '1rem',
                marginTop: '1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.85rem 1.25rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                  {selectedServiceIds.length} serviço{selectedServiceIds.length !== 1 ? 's' : ''} selecionado{selectedServiceIds.length !== 1 ? 's' : ''}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--militar-700)' }}>
                    R$ {totalAmount.toFixed(2).replace('.', ',')}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    (~{totalDuration} min)
                  </span>
                </div>
              </div>

              <button
                className="btn-primary"
                disabled={selectedServiceIds.length === 0}
                onClick={() => setStep(2)}
                style={{ opacity: selectedServiceIds.length === 0 ? 0.5 : 1 }}
              >
                Continuar <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 2: PROFISSIONAL, DATA & HORÁRIO
            ========================================================================= */}
        {step === 2 && (
          <div className="fade-in">
            <button
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '0.75rem' }}
            >
              <ArrowLeft size={14} /> Voltar para serviços
            </button>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              Quando Deseja Ser Atendida? 📅
            </h2>
            <p style={{ margin: '4px 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Escolha a data e o melhor horário na agenda do Belíssima:
            </p>

            {/* Escolha da Profissional */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                Prefere alguma profissional específica?
              </label>
              <select
                className="form-select"
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
              >
                <option value="qualquer">✨ Primeira profissional disponível (Mais rápido)</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role === 'admin' ? 'Especialista Master' : 'Profissional'})
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Data */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                Data do Atendimento *
              </label>
              <input
                type="date"
                min={todayStr}
                className="form-input"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Grade de Horários */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.65rem' }}>
                Horários Livres para {selectedDate.split('-').reverse().join('/')}:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '0.5rem' }}>
                {availableSlots.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedTime(slot.time)}
                      style={{
                        padding: '0.6rem 0.3rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                        border: isSelected ? '1.5px solid var(--gold-400)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'linear-gradient(135deg, var(--militar-500), var(--militar-700))' : slot.isAvailable ? 'var(--bg-app)' : 'var(--bg-card-hover)',
                        color: isSelected ? '#fff' : slot.isAvailable ? 'var(--text-primary)' : 'var(--text-muted)',
                        opacity: slot.isAvailable ? 1 : 0.4
                      }}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                disabled={!selectedTime}
                onClick={() => setStep(3)}
                style={{ opacity: !selectedTime ? 0.5 : 1 }}
              >
                Avançar para Confirmação <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 3: DADOS DA CLIENTE & VALIDAÇÃO ANTI-FALSAS MARCAÇÕES
            ========================================================================= */}
        {step === 3 && (
          <div className="fade-in">
            <button
              onClick={() => setStep(2)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '0.75rem' }}
            >
              <ArrowLeft size={14} /> Voltar para horários
            </button>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              Seus Dados de Contato & Segurança 🛡️
            </h2>
            <p style={{ margin: '4px 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Para garantir sua reserva e evitar marcações falsas, validamos seu WhatsApp:
            </p>

            {validationError && (
              <div style={{ background: '#fdf0ed', border: '1px solid #f8c9c4', color: '#c0392b', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                {validationError}
              </div>
            )}

            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="form-group">
                  <label>Seu Nome Completo *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Mariana Castro"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Seu WhatsApp com DDD *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Ex: 67 99988-7766"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                    Enviaremos a confirmação oficial do seu horário neste número.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Observações ou Preferências (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Alergia a esmalte tradicional, prefere cera morna..."
                    value={clientNotes}
                    onChange={e => setClientNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* CARD DE SEGURANÇA E VALIDAÇÃO ANTI-FRAUDE */}
              <div style={{ background: '#fdf5e6', border: '1px solid #f9e2b2', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#b9770e' }}>
                  <ShieldCheck size={18} />
                  <strong style={{ fontSize: '0.88rem' }}>Validação de Reserva Belíssima</strong>
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: '#7d5108', lineHeight: '1.4' }}>
                  Para evitar robôs e marcações falsas que prejudicam a agenda dos profissionais, confirme o código de segurança abaixo:
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ background: '#fff', border: '1.5px solid var(--gold-400)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', fontWeight: '800', letterSpacing: '4px', fontSize: '1.1rem', color: 'var(--militar-700)' }}>
                    {generatedCode}
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    className="form-input"
                    placeholder="Digite os 4 dígitos"
                    style={{ width: '150px', textAlign: 'center', fontWeight: '700' }}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Resumo Final do Agendamento */}
              <div style={{ background: 'var(--rose-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Data & Horário:</span>
                  <strong>{selectedDate.split('-').reverse().join('/')} às {selectedTime}h</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Total dos Procedimentos:</span>
                  <strong style={{ color: '#1b7440', fontSize: '0.92rem' }}>R$ {totalAmount.toFixed(2).replace('.', ',')}</strong>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
              >
                <CheckCircle2 size={18} /> Solicitar Agendamento
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            PASSO 4: SUCESSO & COMPROVANTE COM VALIDAÇÃO WHATSAPP
            ========================================================================= */}
        {step === 4 && confirmedBookingData && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#eaf5ee',
                color: '#1b7440',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                border: '2px solid #c2e2cc'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              Solicitação Recebida com Sucesso! ✨
            </h2>
            <p style={{ margin: '6px auto 1.5rem auto', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '440px' }}>
              Seu horário foi pré-reservado no <strong>Belíssima</strong>!
            </p>

            {/* Voucher Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--gold-400)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'left',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CÓDIGO DA RESERVA</span>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--militar-700)' }}>#{confirmedBookingData.token}</strong>
                </div>
                <span className="crm-badge crm-badge-recall">Aguardando Confirmação</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div><strong>Cliente:</strong> {confirmedBookingData.clientName} ({confirmedBookingData.clientPhone})</div>
                <div><strong>Data:</strong> {confirmedBookingData.date.split('-').reverse().join('/')} às {confirmedBookingData.time}h</div>
                <div><strong>Procedimentos:</strong> {selectedServiceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')}</div>
                <div style={{ marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                  <strong>Valor Estimado:</strong> <span style={{ color: '#1b7440', fontWeight: '800' }}>R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

            {/* Ação de Conectar no WhatsApp para Garantir Horário */}
            <div style={{ background: 'var(--rose-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                📱 <strong>Garanta sua vaga mais rápido:</strong> Envie o comprovante no WhatsApp do Belíssima com apenas 1 clique para aprovação instantânea!
              </p>
              <button
                onClick={handleOpenSalonWhatsApp}
                className="btn-whatsapp"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.92rem' }}
              >
                <MessageCircle size={18} /> Confirmar Agora no WhatsApp do Salão
              </button>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setSelectedServiceIds([]);
                setSelectedTime('');
                setClientName('');
                setClientPhone('');
              }}
              className="btn-secondary"
            >
              Fazer Outro Agendamento
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
