// LitInvestorBlog-frontend/src/components/ui/RoleBadge.jsx

import React from 'react';
// 1. IMPORTA LE NUOVE ICONE
import { Shield, ShieldHalf, ShieldUser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

// Mappa per tradurre il ruolo in una variante di colore
const ROLE_TO_VARIANT_MAP = {
  admin: 'red',
  collaborator: 'blue',
  user: 'green',
};

// Mappa per ottenere l'etichetta corretta
const ROLE_TO_LABEL_MAP = {
  admin: 'Administrator',
  collaborator: 'Collaborator',
  user: 'User',
};

// 2. NUOVA MAPPA PER LE ICONE
const ROLE_TO_ICON_MAP = {
  admin: Shield,
  collaborator: ShieldHalf,
  user: ShieldUser,
};

const RoleBadge = ({ role, className, showIcon = true }) => {
  // Determina la variante, l'etichetta e l'icona da usare, con fallback sicuri
  const variant = ROLE_TO_VARIANT_MAP[role] || 'gray';
  const label = ROLE_TO_LABEL_MAP[role] || 'Unknown Role';
  const IconComponent = ROLE_TO_ICON_MAP[role] || ShieldUser; // Usa l'icona User se il ruolo è sconosciuto

  return (
    // 3. AGGIUNTA LA CLASSE 'gap-2' PER AUMENTARE LO SPAZIO
    <Badge variant={variant} className={cn('gap-2', className)}>
      {showIcon && <IconComponent size={14} />}
      <span>{label}</span>
    </Badge>
  );
};

export default RoleBadge;