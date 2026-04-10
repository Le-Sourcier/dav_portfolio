import React, { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { useSubscribe } from "@/hooks/queries";
import { useTranslation } from "react-i18next";

export function NewsletterForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const subscribeMutation = useSubscribe();
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    subscribeMutation.mutate(email, {
      onSuccess: () => {
        setSubscribed(true);
        setEmail("");
      },
    });
  };

  return (
    <div className="p-8 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10">
      <div className="flex flex-col gap-6">
        <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <Mail className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-2xl font-black tracking-tight mb-2">
            {t("newsletter.title")}
          </h3>
          <p className="text-muted-foreground font-medium text-sm">
            {t("newsletter.desc")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribed}
            placeholder={t("newsletter.placeholder")}
            className="w-full bg-background border-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={subscribeMutation.isPending || subscribed}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            {subscribeMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : subscribed ? (
              <>
                {t("newsletter.subscribed")} <Check className="w-5 h-5" />
              </>
            ) : (
              t("newsletter.subscribe")
            )}
          </button>
        </form>

        <p className="text-[10px] text-muted-foreground/50 font-medium text-center italic">
          {t("newsletter.noSpam")}
        </p>
      </div>
    </div>
  );
}
