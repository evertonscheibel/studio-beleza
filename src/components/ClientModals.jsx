import React, { useState } from 'react';
import {
  X,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Edit3,
  Trash2,
  User,
  Heart,
  History,
  DollarSign,
  TrendingUp,
  Receipt,
  UserCheck,
  Award,
  Cake,
  FileText
} from 'lucide-react';
import { buildWhatsAppMessage } from '../crmUtils';

/**
 * Modal para Cadastrar Nova Cliente ou Editar Cliente existente
 */
export function ClientModal({ initialData, onClose, onSave }) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [birthdate, setBirthdate] = useState(initialData?.birthdate || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [hairProfile, setHairProfile] = useState(initialData?.hairProfile || '');
  const [beautyProfile, setBeautyProfile] = useState(initialData?.beautyProfile || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome da cliente.');
      return;
    }
    if (!phone.trim()) {
      alert('Por favor, informe o telefone/WhatsApp da cliente.');
      return;
    }

    onSave({
      id: initialData?.id || `cli-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      birthdate: birthdate.trim(),
      email: email.trim(),
      hairProfile: hairProfile.trim(),
      beautyProfile: beautyProfile.trim(),
      notes: notes.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="sheet-handle"></div>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="crm-kpi-icon" style={{ background: 'var(--militar-50)', color: 'var(--militar-600)' }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{initialData ? 'Editar Cliente' : 'Cadastrar Nova Cliente'}</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Ficha cadastral completa e perfil de cuidados do Belíssima
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Informações Básicas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.85rem' }}>
              <div className="form-group">
                <label>Nome Completo da Cliente *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Gabriela Ribeiro"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefone / WhatsApp com DDD *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Ex: 67 99988-7766"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.85rem' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Cake size={14} color="var(--gold-500)" /> Data de Nascimento / Aniversário
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={birthdate}
                  onChange={e => setBirthdate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>E-mail (Opcional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Ficha Capilar e Anamnese */}
            <div style={{ marginTop: '0.5rem', background: 'var(--rose-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--militar-700)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Scissors size={15} color="var(--gold-500)" /> Perfil Capilar & Químicas
              </h4>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Mechas loiras, progressiva sem formol, raiz oleosa e pontas secas..."
                  value={hairProfile}
                  onChange={e => setHairProfile(e.target.value)}
                />
              </div>
            </div>

            {/* Ficha Estética & Depilação */}
            <div style={{ marginTop: '0.75rem', background: 'var(--rose-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--militar-700)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={15} color="var(--gold-500)" /> Sobrancelhas, Cílios & Depilação
              </h4>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Henna castanho médio, sensibilidade a cera quente, prefere pinça..."
                  value={beautyProfile}
                  onChange={e => setBeautyProfile(e.target.value)}
                />
              </div>
            </div>

            {/* Observações Gerais */}
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label>Observações & Preferências da Cliente</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Ex: Gosta de café sem açúcar, prefere atendimentos às quintas-feiras pela manhã..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <UserCheck size={16} /> {initialData ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal Completo de Ficha de CRM da Cliente
 * Mostra: Histórico de Procedimentos, Procedimentos que costuma fazer, Tempo médio entre procedimentos e recomendações.
 */
export function ClientDetailsModal({
  crmData,
  services,
  staff,
  onClose,
  onEdit,
  onDelete,
  onNewAppointment
}) {
  const { client, clientAppointments, favoriteServices, averageIntervalDays, daysSinceLastVisit, totalVisits, totalSpent, ticketMedio, recommendation, badgeClass, statusText } = crmData;

  const [activeSubTab, setActiveSubTab] = useState('crm'); // 'crm', 'historico', 'ficha'

  const handleOpenWhatsApp = (type = 'retorno') => {
    const text = buildWhatsAppMessage(client, crmData, type);
    const clean = client.phone.replace(/\D/g, '');
    const full = clean.startsWith('55') ? clean : `55${clean}`;
    window.open(`https://api.whatsapp.com/send?phone=${full}&text=${text}`, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="sheet-handle"></div>
        
        {/* Header da Cliente */}
        <div className="modal-header" style={{ paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--militar-500), var(--militar-700))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.2rem',
                border: '2px solid var(--gold-400)'
              }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{client.name}</h3>
                <span className={`crm-badge ${badgeClass}`}>{statusText}</span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {client.phone} {client.email ? `• ${client.email}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Sub-Tabs: CRM & Ciclos, Histórico de Comandas, Ficha Técnica */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)', padding: '0 1.25rem' }}>
          <button
            onClick={() => setActiveSubTab('crm')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'crm' ? '2.5px solid var(--gold-500)' : '2.5px solid transparent',
              color: activeSubTab === 'crm' ? 'var(--militar-700)' : 'var(--text-muted)',
              fontWeight: activeSubTab === 'crm' ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <TrendingUp size={15} /> CRM & Frequência
          </button>
          <button
            onClick={() => setActiveSubTab('historico')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'historico' ? '2.5px solid var(--gold-500)' : '2.5px solid transparent',
              color: activeSubTab === 'historico' ? 'var(--militar-700)' : 'var(--text-muted)',
              fontWeight: activeSubTab === 'historico' ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <History size={15} /> Histórico de Visitas ({clientAppointments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ficha')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'ficha' ? '2.5px solid var(--gold-500)' : '2.5px solid transparent',
              color: activeSubTab === 'ficha' ? 'var(--militar-700)' : 'var(--text-muted)',
              fontWeight: activeSubTab === 'ficha' ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={15} /> Ficha de Cuidados
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '1.25rem' }}>
          {/* TAB CRM */}
          {activeSubTab === 'crm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* KPIs de Intervalo e Frequência do Cliente */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'var(--rose-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    TEMPO DE RETORNO
                  </span>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--militar-700)', marginTop: '2px' }}>
                    {averageIntervalDays ? `A cada ${averageIntervalDays} dias` : totalVisits > 0 ? '1ª visita feita' : 'Sem histórico'}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Média entre visitas</span>
                </div>

                <div style={{ background: 'var(--rose-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    ÚLTIMO PROCEDIMENTO
                  </span>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--gold-600)', marginTop: '2px' }}>
                    {daysSinceLastVisit !== null ? `Há ${daysSinceLastVisit} dias` : 'Nunca veio'}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {crmData.lastVisitDate ? crmData.lastVisitDate.split('-').reverse().join('/') : 'Aguardando'}
                  </span>
                </div>

                <div style={{ background: 'var(--rose-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    TOTAL INVESTIDO
                  </span>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: '#1b7440', marginTop: '2px' }}>
                    R$ {totalSpent.toFixed(2).replace('.', ',')}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ticket Médio: R$ {ticketMedio.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Box de Recomendação Inteligente do CRM */}
              <div
                style={{
                  background: crmData.status === 'retorno_sugerido' ? '#fdf5e6' : crmData.status === 'ausente' ? '#fdf0ed' : '#eaf5ee',
                  border: `1px solid ${crmData.status === 'retorno_sugerido' ? '#f9e2b2' : crmData.status === 'ausente' ? '#f8c9c4' : '#c2e2cc'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <div style={{ marginTop: '2px', color: crmData.status === 'retorno_sugerido' ? '#b9770e' : crmData.status === 'ausente' ? '#c0392b' : '#1b7440' }}>
                  <Sparkles size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.88rem', color: crmData.status === 'retorno_sugerido' ? '#9a630b' : crmData.status === 'ausente' ? '#a93226' : '#145a32', display: 'block' }}>
                    Diagnóstico de CRM Belíssima:
                  </strong>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {recommendation}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenWhatsApp('retorno')}
                  className="btn-whatsapp"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', flexShrink: 0 }}
                >
                  <MessageCircle size={14} /> Chamar Agora
                </button>
              </div>

              {/* Procedimentos que Costuma Fazer */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                  <Scissors size={16} color="var(--gold-500)" /> Procedimentos que Mais Costuma Fazer
                </h4>

                {favoriteServices.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Nenhum serviço registrado para esta cliente ainda. Os procedimentos serão contabilizados conforme forem realizados nos agendamentos.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {favoriteServices.map((fav, index) => (
                      <div
                        key={fav.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.85rem',
                          background: index === 0 ? 'var(--rose-50)' : 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: index === 0 ? 'var(--gold-400)' : 'var(--bg-card-hover)',
                              color: index === 0 ? '#2c2514' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: '700'
                            }}
                          >
                            {index + 1}º
                          </span>
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{fav.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                              Última execução: {fav.lastDate.split('-').reverse().join('/')}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              color: 'var(--militar-700)',
                              background: 'var(--bg-card)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            {fav.count} vez{fav.count > 1 ? 'es' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB HISTÓRICO DE VISITAS */}
          {activeSubTab === 'historico' && (
            <div>
              {clientAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <History size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: '600' }}>Nenhum atendimento no histórico ainda</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Clique em "+ Agendar Horário" para marcar a primeira visita da cliente.</p>
                </div>
              ) : (
                <div className="timeline-track">
                  {clientAppointments.slice().reverse().map((apt) => {
                    const aptServices = (apt.serviceIds || [])
                      .map(id => services.find(s => s.id === id)?.name)
                      .filter(Boolean)
                      .join(', ');
                    const staffMember = staff.find(st => st.id === apt.staffId);
                    const formattedDate = apt.date.split('-').reverse().join('/');

                    return (
                      <div key={apt.id} className="timeline-entry">
                        <div className="timeline-dot"></div>
                        <div
                          style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.85rem 1rem',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{formattedDate}</strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>às {apt.time}h</span>
                            </div>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: apt.status === 'concluido' ? '#eaf5ee' : apt.status === 'atendendo' ? '#fdf5e6' : 'var(--rose-50)',
                                color: apt.status === 'concluido' ? '#1b7440' : apt.status === 'atendendo' ? '#b9770e' : 'var(--militar-700)',
                                border: '1px solid var(--border-subtle)'
                              }}
                            >
                              {apt.status === 'concluido' ? 'Concluído' : apt.status === 'atendendo' ? 'Atendendo' : 'Agendado'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '4px 0' }}>
                            <strong>Serviços:</strong> {aptServices || 'Nenhum informado'}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span>Profissional: {staffMember ? staffMember.name : 'Equipe'}</span>
                            {apt.payment?.total ? (
                              <strong style={{ color: '#1b7440', fontSize: '0.88rem' }}>
                                R$ {apt.payment.total.toFixed(2).replace('.', ',')} ({apt.payment.method || 'Pago'})
                              </strong>
                            ) : null}
                          </div>

                          {apt.notes && (
                            <div style={{ marginTop: '6px', padding: '4px 8px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                              Obs: {apt.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB FICHA TÉCNICA */}
          {activeSubTab === 'ficha' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--militar-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Scissors size={15} color="var(--gold-500)" /> Ficha Capilar & Químicas
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: client.hairProfile ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {client.hairProfile || 'Nenhuma observação capilar registrada.'}
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--militar-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={15} color="var(--gold-500)" /> Sobrancelhas, Cílios & Depilação
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: client.beautyProfile ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {client.beautyProfile || 'Nenhuma preferência estética registrada.'}
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--militar-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={15} color="var(--gold-500)" /> Observações & Hábitos
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: client.notes ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {client.notes || 'Nenhuma observação geral registrada.'}
                </p>
              </div>

              {client.birthdate && (
                <div style={{ background: 'var(--rose-50)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cake size={18} color="var(--gold-500)" />
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Aniversário</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {client.birthdate.split('-').reverse().join('/')}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleOpenWhatsApp('aniversario')} className="btn-whatsapp" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                    <MessageCircle size={14} /> Felicitar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onEdit(client)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
            >
              <Edit3 size={14} /> Editar
            </button>
            <button
              onClick={() => onDelete(client.id)}
              className="btn-icon"
              style={{ color: '#dc2626', width: '38px', height: '38px' }}
              title="Excluir Cliente"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleOpenWhatsApp('retorno')}
              className="btn-whatsapp"
              style={{ fontSize: '0.85rem' }}
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button
              onClick={() => onNewAppointment(client)}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}
            >
              <Calendar size={16} /> + Agendar Horário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
