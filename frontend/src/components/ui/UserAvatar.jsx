import React from 'react';
import { clsx } from 'clsx';
// Importiamo i "mattoncini LEGO" dal file avatar.jsx
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

// La tua logica per i colori rimane identica
const avatarColorClasses = [
  'bg-avatar-1', 'bg-avatar-2', 'bg-avatar-3', 'bg-avatar-4', 'bg-avatar-5',
  'bg-avatar-6', 'bg-avatar-7', 'bg-avatar-8', 'bg-avatar-9', 'bg-avatar-10',
  'bg-avatar-11', 'bg-avatar-12',
];
const getAvatarClasses = (identifier) => {
  const key = identifier || 'default-user';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColorClasses.length;
  return {
    bgColor: avatarColorClasses[index],
    textColor: 'text-antracite',
  };
};

const UserAvatar = (props) => {
  const {
    username,
    first_name,
    last_name,
    imageUrl,
    size = 32,
    className // Aggiungiamo className per passarlo al contenitore
  } = props;

  // La tua logica per le iniziali rimane identica
  const hasFirstName = !!first_name?.trim();
  const hasLastName = !!last_name?.trim();
  const hasUsername = !!username?.trim();
  let initials = '';
  if (hasFirstName && hasLastName) {
    initials = `${first_name.trim().charAt(0)}${last_name.trim().charAt(0)}`;
  } else if (hasFirstName && hasUsername) {
    initials = `${first_name.trim().charAt(0)}${username.trim().charAt(0)}`;
  } else if (hasUsername && username.trim().length >= 2) {
    initials = username.trim().slice(0, 2);
  } else if (hasFirstName) {
    initials = first_name.trim().charAt(0);
  } else if (hasUsername) {
    initials = username.trim().charAt(0);
  } else {
    initials = '?';
  }
  initials = initials.toUpperCase();

  const { bgColor, textColor } = getAvatarClasses(username || first_name);
  const fontSize = initials.length > 1 ? size / 2.5 : size / 2;

  // Ora usiamo i componenti di shadcn/ui per comporre l'avatar
  return (
    <Avatar
      className={className}
      style={{ width: size, height: size }}
    >
      {/*
        AvatarImage prova a caricare l'immagine. Se l'URL è nullo, non valido,
        o l'immagine non si carica, si nasconde automaticamente e mostra AvatarFallback.
        Non serve più la logica `if (imageUrl)`.
      */}
      <AvatarImage src={imageUrl} alt={username || 'User Avatar'} />

      {/*
        AvatarFallback viene mostrato automaticamente quando l'immagine non c'è o fallisce.
        Noi gli diamo lo stile e le iniziali da mostrare.
      */}
      <AvatarFallback
        className={clsx('font-semibold select-none', bgColor, textColor)}
        style={{ fontSize: fontSize, lineHeight: 1 }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;