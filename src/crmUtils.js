/**
 * CRM Intelligence Utilities for Belíssima Salão Feminino
 * Calculates client return cycles, frequent procedures, average interval between visits, and recommendations.
 */

export function calculateClientCRM(client, appointments = [], services = []) {
  const cleanPhone = (client.phone || '').replace(/\D/g, '');
  const cleanName = (client.name || '').trim().toLowerCase();

  // Find all appointments matching this client by phone or name
  const clientAppointments = appointments.filter(a => {
    const aPhone = (a.clientPhone || '').replace(/\D/g, '');
    const aName = (a.clientName || '').trim().toLowerCase();
    const phoneMatch = cleanPhone && aPhone && (aPhone.endsWith(cleanPhone) || cleanPhone.endsWith(aPhone));
    const nameMatch = cleanName && aName && (cleanName === aName || cleanName.includes(aName) || aName.includes(cleanName));
    return phoneMatch || nameMatch;
  }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Completed appointments & financial metrics
  const completedAppointments = clientAppointments.filter(a => a.status === 'concluido');
  const totalVisits = completedAppointments.length || clientAppointments.length;
  const totalSpent = completedAppointments.reduce((sum, a) => sum + (a.payment?.total || 0), 0);
  const ticketMedio = totalVisits > 0 ? (totalSpent / totalVisits) : 0;

  // Procedures frequency & favorites
  const serviceStatsMap = {};
  clientAppointments.forEach(apt => {
    (apt.serviceIds || []).forEach(sId => {
      const s = services.find(x => x.id === sId);
      const name = s ? s.name : sId;
      const category = s ? s.category : 'cabelo';
      if (!serviceStatsMap[name]) {
        serviceStatsMap[name] = { name, count: 0, category, lastDate: apt.date };
      }
      serviceStatsMap[name].count += 1;
      if (apt.date > serviceStatsMap[name].lastDate) {
        serviceStatsMap[name].lastDate = apt.date;
      }
    });
  });

  const favoriteServices = Object.values(serviceStatsMap).sort((a, b) => b.count - a.count);

  // Interval between visits calculation (chronological diffs between unique visit dates)
  const uniqueDates = Array.from(new Set(clientAppointments.map(a => a.date))).sort();
  let averageIntervalDays = null;

  if (uniqueDates.length >= 2) {
    let diffDaysSum = 0;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1] + 'T12:00:00');
      const currDate = new Date(uniqueDates[i] + 'T12:00:00');
      const diffMs = currDate - prevDate;
      const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      diffDaysSum += diffDays;
    }
    averageIntervalDays = Math.round(diffDaysSum / (uniqueDates.length - 1));
  }

  // Days since last visit
  const lastVisitDate = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : null;
  let daysSinceLastVisit = null;

  if (lastVisitDate) {
    const today = new Date();
    const lastDateObj = new Date(lastVisitDate + 'T12:00:00');
    daysSinceLastVisit = Math.max(0, Math.floor((today - lastDateObj) / (1000 * 60 * 60 * 24)));
  }

  // Reference cycle: average interval calculated or default salon cycle (28 days)
  const referenceInterval = averageIntervalDays || 28;

  let status = 'nova'; // 'em_dia', 'retorno_sugerido', 'ausente', 'nova'
  let statusText = 'Nova Cliente';
  let badgeClass = 'crm-badge-new';
  let recommendation = '';

  if (uniqueDates.length === 0) {
    status = 'nova';
    statusText = 'Sem Atendimentos';
    badgeClass = 'crm-badge-new';
    recommendation = 'Cadastrada no sistema • Aguardando primeiro agendamento';
  } else if (daysSinceLastVisit > Math.max(referenceInterval + 7, 35)) {
    if (daysSinceLastVisit > 60) {
      status = 'ausente';
      statusText = 'Ausente (+60 dias)';
      badgeClass = 'crm-badge-inactive';
      recommendation = `Última visita há ${daysSinceLastVisit} dias. Sugerir promoção de resgate ou novo cuidado.`;
    } else {
      status = 'retorno_sugerido';
      statusText = 'Sugerir Retorno';
      badgeClass = 'crm-badge-recall';
      const diff = daysSinceLastVisit - referenceInterval;
      recommendation = `Costuma retornar a cada ${referenceInterval} dias. Última visita há ${daysSinceLastVisit} dias (${diff > 0 ? `${diff} dias após o prazo habitual` : 'no período ideal de retoque'}).`;
    }
  } else {
    status = 'em_dia';
    statusText = 'Em Dia';
    badgeClass = 'crm-badge-ontime';
    recommendation = `Atendimento recente há ${daysSinceLastVisit} dias. Intervalo habitual: a cada ${referenceInterval} dias.`;
  }

  // Next future appointment (if any)
  const todayStr = new Date().toISOString().split('T')[0];
  const nextAppointment = clientAppointments.find(a => a.date >= todayStr && a.status === 'agendado');

  return {
    client,
    clientAppointments,
    totalVisits,
    completedVisitsCount: completedAppointments.length,
    totalSpent,
    ticketMedio,
    favoriteServices,
    uniqueDates,
    averageIntervalDays,
    lastVisitDate,
    daysSinceLastVisit,
    status,
    statusText,
    badgeClass,
    recommendation,
    nextAppointment
  };
}

/**
 * Builds personalized WhatsApp messages for CRM follow-ups
 */
export function buildWhatsAppMessage(client, crmData, type = 'retorno') {
  const firstName = (client.name || 'Cliente').split(' ')[0];
  const topService = crmData.favoriteServices[0]?.name || 'seus cuidados de beleza';

  if (type === 'retorno') {
    const days = crmData.daysSinceLastVisit || 30;
    return encodeURIComponent(
      `Olá, ${firstName}! ✨ Tudo bem com você?\n\nPassando com muito carinho para lembrar que já faz cerca de *${days} dias* desde a sua última visita no *Belíssima* para fazer *${topService}*.\n\nComo está seu visual? Estamos com horários especiais esta semana! Quer aproveitar para agendar e renovar seu autocuidado? 💕`
    );
  }

  if (type === 'aniversario') {
    return encodeURIComponent(
      `Parabéns, ${firstName}! 🎉🎂✨\nToda a equipe do *Belíssima* deseja um dia iluminado, repleto de alegria e beleza!\n\nComo presente especial, preparamos um carinho exclusivo para você no seu próximo atendimento com a gente. Venha comemorar cuidando de você! 🥂💕`
    );
  }

  // Default friendly conversation
  return encodeURIComponent(
    `Olá, ${firstName}! 💕 Tudo bem? Passando para saber como você está e se precisa de algum cuidado aqui no *Belíssima*!`
  );
}
