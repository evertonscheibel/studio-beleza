import React, { useState } from 'react';
import { X, Lock, Key, Eye, EyeOff, Check, RefreshCw } from 'lucide-react';

export function ResetPasswordModal({ user, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = 'Beli@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
    setConfirmPassword(res);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Informe a nova senha.');
      return;
    }
    if (newPassword.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    onSave(user.id, newPassword);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="sheet-handle"></div>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="crm-kpi-icon" style={{ background: '#fdf5e6', color: '#b9770e' }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Resetar Senha de Acesso</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Usuário: <strong>{user.name}</strong> ({user.role})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '34px', height: '34px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {error && (
              <div style={{ background: '#fdf0ed', border: '1px solid #f8c9c4', color: '#c0392b', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Nova Senha *</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  style={{ background: 'none', border: 'none', color: 'var(--gold-600)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <RefreshCw size={12} /> Gerar Senha Provisória
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Digite a nova senha..."
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(''); }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar Nova Senha *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repita a nova senha..."
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                required
              />
            </div>

            <div style={{ background: 'var(--rose-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              🔒 O usuário precisará utilizar esta nova senha para entrar e alternar sessões no sistema.
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} /> Confirmar Nova Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
