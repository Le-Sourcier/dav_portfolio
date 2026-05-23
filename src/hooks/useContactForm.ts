/**
 * Hook d'orchestration du formulaire de contact.
 *
 * Responsabilités :
 *  - état des champs + erreurs par champ
 *  - validation live (au blur, au submit)
 *  - autosave brouillon dans localStorage (debounce 400ms)
 *  - anti-spam : honeypot + cooldown 30s entre deux envois
 *  - statut d'envoi (idle/loading/success/error)
 *
 * Aucune dépendance UI : retourne uniquement des données et callbacks.
 */
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { contactsApi } from "@/services/api/contacts.api";
import {
  CONTACT_LIMITS,
  ContactFormErrors,
  ContactFormFields,
  isContactFormValid,
  validateContactField,
  validateContactForm,
} from "@/utils/contactValidation";

const STORAGE_KEY = "contact-form-draft-v1";
const COOLDOWN_KEY = "contact-form-cooldown-v1";
const COOLDOWN_MS = 30_000;
const AUTOSAVE_DEBOUNCE_MS = 400;

const EMPTY_FORM: ContactFormFields = {
  name: "",
  email: "",
  company: "",
  budget: "",
  message: "",
};

export type ContactFormStatus = "idle" | "loading" | "success" | "error";

export type ContactValidationMessages = Record<string, string>;

type UseContactFormParams = {
  validationMessages: ContactValidationMessages;
  successMessage: string;
  cooldownMessage: string;
  genericErrorMessage: string;
};

const readDraft = (): ContactFormFields | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ContactFormFields>;
    return { ...EMPTY_FORM, ...parsed };
  } catch {
    return null;
  }
};

const writeDraft = (values: ContactFormFields): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // quota plein ou private mode — on ignore silencieusement, l'autosave est best-effort
  }
};

const clearDraft = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

const getCooldownRemaining = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return 0;
    const sentAt = Number(raw);
    if (Number.isNaN(sentAt)) return 0;
    const remaining = sentAt + COOLDOWN_MS - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
};

const markSent = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // ignore
  }
};

export const useContactForm = ({
  validationMessages,
  successMessage,
  cooldownMessage,
  genericErrorMessage,
}: UseContactFormParams) => {
  const [values, setValues] = useState<ContactFormFields>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormFields, boolean>>>({});
  const [status, setStatus] = useState<ContactFormStatus>("idle");
  const [feedback, setFeedback] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restaure le brouillon au montage
  useEffect(() => {
    const draft = readDraft();
    if (draft) setValues(draft);
    setCooldownLeft(getCooldownRemaining());
  }, []);

  // Cooldown tick (1s) tant qu'il reste du temps
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const id = setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldownLeft(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownLeft]);

  // Autosave debounced
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      writeDraft(values);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [values]);

  const setField = useCallback(
    <K extends keyof ContactFormFields>(field: K, value: ContactFormFields[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // si le champ avait une erreur, on la révalide à la frappe pour donner un feedback rapide
      if (errors[field]) {
        const next = validateContactField(field, value, validationMessages);
        setErrors((prev) => {
          const updated = { ...prev };
          if (next) updated[field] = next;
          else delete updated[field];
          return updated;
        });
      }
    },
    [errors, validationMessages],
  );

  const handleBlur = useCallback(
    (field: keyof ContactFormFields) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateContactField(field, values[field], validationMessages);
      setErrors((prev) => {
        const updated = { ...prev };
        if (error) updated[field] = error;
        else delete updated[field];
        return updated;
      });
    },
    [values, validationMessages],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Anti-spam honeypot — un bot remplit le champ caché, on coupe sans rien dire au backend
      if (honeypotRef.current?.value) {
        setStatus("error");
        setFeedback(genericErrorMessage);
        return;
      }

      // Cooldown
      const remaining = getCooldownRemaining();
      if (remaining > 0) {
        setCooldownLeft(remaining);
        setStatus("error");
        setFeedback(cooldownMessage);
        return;
      }

      // Validation complète
      const formErrors = validateContactForm(values, validationMessages);
      setErrors(formErrors);
      setTouched({
        name: true,
        email: true,
        company: true,
        budget: true,
        message: true,
      });
      if (!isContactFormValid(formErrors)) {
        setStatus("error");
        setFeedback("");
        // Focus le premier champ en erreur pour guider l'utilisateur
        if (typeof window !== "undefined") {
          const firstErrorField = (Object.keys(formErrors) as (keyof ContactFormFields)[])[0];
          if (firstErrorField) {
            const el = document.getElementById(`contact-${firstErrorField}`);
            if (el) {
              el.focus({ preventScroll: false });
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }
        return;
      }

      setStatus("loading");
      setFeedback("");

      try {
        await contactsApi.create({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: `Projet SaaS - ${values.company.trim() || values.name.trim() || "Premier échange"}`,
          message: [
            values.company ? `Entreprise: ${values.company.trim()}` : "",
            values.budget ? `Cadre: ${values.budget}` : "",
            values.message.trim(),
          ]
            .filter(Boolean)
            .join("\n\n"),
        });
        markSent();
        setCooldownLeft(COOLDOWN_MS);
        setStatus("success");
        setFeedback(successMessage);
        setValues(EMPTY_FORM);
        setTouched({});
        setErrors({});
        clearDraft();
      } catch (error) {
        setStatus("error");
        setFeedback(error instanceof Error ? error.message : genericErrorMessage);
      }
    },
    [values, validationMessages, successMessage, cooldownMessage, genericErrorMessage],
  );

  return {
    values,
    errors,
    touched,
    status,
    feedback,
    cooldownLeft,
    limits: CONTACT_LIMITS,
    honeypotRef,
    setField,
    handleBlur,
    handleSubmit,
  };
};
