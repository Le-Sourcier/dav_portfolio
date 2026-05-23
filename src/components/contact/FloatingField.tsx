"use client";

/**
 * Wrapper d'un champ avec floating label et zone d'erreur.
 *
 * Reçoit l'élément input/select/textarea déjà câblé en children.
 * Le label flotte au-dessus quand le champ a une valeur ou le focus.
 */
import { ReactNode } from "react";

interface FloatingFieldProps {
  id: string;
  label: string;
  hasValue: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

export function FloatingField({ id, label, hasValue, error, hint, children }: FloatingFieldProps) {
  return (
    <div className={`floating-field${hasValue ? " is-filled" : ""}${error ? " is-invalid" : ""}`}>
      <div className="floating-field-control">
        {children}
        <label htmlFor={id} className="floating-field-label">
          {label}
        </label>
      </div>
      {error ? (
        <p className="floating-field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="floating-field-hint">{hint}</p>
      ) : null}
    </div>
  );
}
