import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import type { OtpStatus } from '@/hooks/useVisitorSession';

interface OtpVerificationProps {
  email: string;
  otpStatus: OtpStatus;
  otpError: string | null;
  onVerify: (code: string, remember: boolean) => void;
  onResend: () => void;
  remember: boolean;
  onRememberChange: (val: boolean) => void;
  compact?: boolean;
}

export function OtpVerification({
  email,
  otpStatus,
  otpError,
  onVerify,
  onResend,
  remember,
  onRememberChange,
  compact = false,
}: OtpVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      onVerify(fullCode, remember);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      onVerify(pasted, remember);
    }
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    setCountdown(60);
    onResend();
    inputRefs.current[0]?.focus();
  };

  const isVerifying = otpStatus === 'verifying';
  const maskedEmail = email.replace(/(.{2})(.*)(@)/, '$1***$3');

  const inputSize = compact ? 'w-9 h-10 text-lg' : 'w-11 h-12 text-xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={compact ? 'space-y-3' : 'space-y-4'}
    >
      <div className="text-center">
        <div className={`flex items-center justify-center gap-2 mb-2 ${compact ? 'text-[11px]' : 'text-sm'}`}>
          <ShieldCheck className={compact ? 'w-3.5 h-3.5 text-primary' : 'w-4 h-4 text-primary'} />
          <span className="font-bold">Verification par email</span>
        </div>
        <p className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>
          Code envoye a <strong>{maskedEmail}</strong>
        </p>
      </div>

      {/* 6-digit input */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
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
            disabled={isVerifying}
            className={`${inputSize} text-center font-black rounded-xl border-2 outline-none transition-all
              ${digit ? 'border-primary bg-primary/5' : 'border-border bg-background'}
              focus:border-primary focus:ring-2 focus:ring-primary/20
              disabled:opacity-50`}
          />
        ))}
      </div>

      {/* Error */}
      {otpError && (
        <div className={`flex items-center justify-center gap-1.5 text-destructive ${compact ? 'text-[10px]' : 'text-xs'}`}>
          <AlertCircle className="w-3 h-3" />
          <span className="font-medium">{otpError}</span>
        </div>
      )}

      {/* Loading */}
      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className={compact ? 'text-[10px]' : 'text-xs'}>Verification...</span>
        </div>
      )}

      {/* Remember me */}
      <label className="flex items-center justify-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => onRememberChange(e.target.checked)}
          className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} rounded border-border text-primary focus:ring-primary`}
        />
        <span className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>
          Se souvenir de moi
        </span>
      </label>

      {/* Resend */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className={`text-muted-foreground ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
            Renvoyer dans {countdown}s
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={otpStatus === 'sending'}
            className={`inline-flex items-center gap-1.5 text-primary font-bold hover:underline disabled:opacity-50 ${compact ? 'text-[10px]' : 'text-xs'}`}
          >
            <RefreshCw className="w-3 h-3" />
            Renvoyer le code
          </button>
        )}
      </div>
    </motion.div>
  );
}
