"use client";

import { useState, useRef, useEffect } from "react";

interface OtpInputProps {
  email: string;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export function OtpInput({ email, onComplete, disabled }: OtpInputProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      onComplete(pasted);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@)/, "$1***$3");

  return (
    <div className="otp-input-wrap">
      <p className="otp-input-label">
        Code envoyé à <strong>{maskedEmail}</strong>
      </p>
      <div className="otp-input-digits" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={disabled}
            className="otp-input-digit"
          />
        ))}
      </div>
    </div>
  );
}
