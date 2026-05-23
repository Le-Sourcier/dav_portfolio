/**
 * Validation pure du formulaire de contact.
 *
 * Pas de side-effect, pas de dépendance React. Réutilisable côté tests
 * et côté serveur si besoin.
 */

export type ContactFormFields = {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
};

export type ContactFormErrors = Partial<Record<keyof ContactFormFields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  emailMax: 160,
  companyMax: 120,
  messageMin: 20,
  messageMax: 1000,
} as const;

export const validateContactField = (
  field: keyof ContactFormFields,
  value: string,
  messages: Record<string, string>,
): string | undefined => {
  const v = value.trim();

  if (field === "name") {
    if (v.length === 0) return messages.required;
    if (v.length < CONTACT_LIMITS.nameMin) return messages.nameTooShort;
    if (v.length > CONTACT_LIMITS.nameMax) return messages.nameTooLong;
    return undefined;
  }

  if (field === "email") {
    if (v.length === 0) return messages.required;
    if (!EMAIL_RE.test(v)) return messages.emailInvalid;
    if (v.length > CONTACT_LIMITS.emailMax) return messages.emailTooLong;
    return undefined;
  }

  if (field === "company") {
    if (v.length > CONTACT_LIMITS.companyMax) return messages.companyTooLong;
    return undefined;
  }

  if (field === "message") {
    if (v.length === 0) return messages.required;
    if (v.length < CONTACT_LIMITS.messageMin) return messages.messageTooShort;
    if (v.length > CONTACT_LIMITS.messageMax) return messages.messageTooLong;
    return undefined;
  }

  // budget : optionnel, aucune contrainte
  return undefined;
};

export const validateContactForm = (
  values: ContactFormFields,
  messages: Record<string, string>,
): ContactFormErrors => {
  const errors: ContactFormErrors = {};
  (Object.keys(values) as (keyof ContactFormFields)[]).forEach((field) => {
    const error = validateContactField(field, values[field], messages);
    if (error) errors[field] = error;
  });
  return errors;
};

export const isContactFormValid = (errors: ContactFormErrors): boolean =>
  Object.keys(errors).length === 0;
