"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

interface AssistantComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function AssistantComposer({ onSend, disabled }: AssistantComposerProps) {
  const t = useTranslations("Assistant");
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form className="assistant-composer" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="assistant-input">
        {t("formLabel")}
      </label>
      <div className="assistant-composer-field">
        <input
          id="assistant-input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("inputPlaceholder")}
          autoComplete="off"
          disabled={disabled}
          maxLength={1000}
        />
        <button
          type="submit"
          className="assistant-composer-send"
          disabled={disabled || value.trim().length === 0}
          aria-label={t("submitButton")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3.4 20.6 21 12 3.4 3.4l3.1 6.9L15 12l-8.5 1.7-3.1 6.9Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
