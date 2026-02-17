import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Lock, Palette, Globe, Sun, Moon, Monitor, Check, Camera, Shield, Eye, EyeOff, Loader2, CheckCircle2, Bot, Plus, Trash2, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, applyTheme, type ThemeMode, type ProfileData, type SocialLinks, type SeoData, type ChatbotSettings, type ChatbotQuickAction } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { useUpdateSettings } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Section = 'profile' | 'security' | 'appearance' | 'seo' | 'chatbot';

const sectionList: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Securite', icon: Lock },
  { id: 'appearance', label: 'Apparence', icon: Palette },
  { id: 'seo', label: 'SEO & Meta', icon: Globe },
  { id: 'chatbot', label: 'Chatbot', icon: Bot },
];

// --- Small reusable pieces ---
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-medium text-zinc-500 dark:text-zinc-500 mb-1.5">{children}</label>;
}

function FieldInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn('h-9 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus-visible:ring-1 focus-visible:ring-zinc-400', props.className)}
    />
  );
}

function SaveButton({ onClick, label = 'Enregistrer', loading = false, saved = false }: { onClick: () => void; label?: string; loading?: boolean; saved?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'h-9 px-5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-60',
        saved
          ? 'bg-emerald-600 text-white'
          : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
      )}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
      {saved ? 'Enregistre !' : label}
    </button>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        {description && <p className="text-[13px] text-zinc-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// --- Hook: save feedback ---
function useSaveFeedback() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const trigger = useCallback((saveFn: () => void) => {
    setSaving(true);
    // Simulate slight delay for UX
    setTimeout(() => {
      saveFn();
      setSaving(false);
      setSaved(true);
      toast.success('Modifications enregistrees');
      setTimeout(() => setSaved(false), 2000);
    }, 400);
  }, []);

  return { saving, saved, trigger };
}

// ===================== MAIN COMPONENT =====================
const VALID_SECTIONS: Section[] = ['profile', 'security', 'appearance', 'seo', 'chatbot'];

export function SettingsPage() {
  const { user } = useAuthStore();
  const settings = useSettingsStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync section with URL ?section= param
  const urlSection = searchParams.get('section') as Section | null;
  const activeSection: Section = urlSection && VALID_SECTIONS.includes(urlSection) ? urlSection : 'profile';

  const setActiveSection = useCallback((section: Section) => {
    const params = new URLSearchParams(searchParams);
    if (section === 'profile') {
      params.delete('section');
    } else {
      params.set('section', section);
    }
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // --- Profile state ---
  const [profileForm, setProfileForm] = useState<ProfileData>({ ...settings.profile });
  const [socialForm, setSocialForm] = useState<SocialLinks>({ ...settings.socialLinks });
  const profileSave = useSaveFeedback();
  const socialSave = useSaveFeedback();

  // --- Security state ---
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const passwordSave = useSaveFeedback();

  // --- Appearance ---
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(settings.theme);
  const [displayPrefs, setDisplayPrefs] = useState({ ...settings.display });

  // --- SEO ---
  const [seoForm, setSeoForm] = useState<SeoData>({ ...settings.seo });
  const seoSave = useSaveFeedback();

  // --- Chatbot ---
  const [chatbotForm, setChatbotForm] = useState<ChatbotSettings>({ ...settings.chatbot });
  const chatbotSave = useSaveFeedback();

  // --- API sync ---
  const updateSettingsMutation = useUpdateSettings();

  // Apply theme on change
  useEffect(() => {
    applyTheme(selectedTheme);
    settings.setTheme(selectedTheme);
  }, [selectedTheme]);

  // Apply display preferences
  useEffect(() => {
    settings.updateDisplay(displayPrefs);
    if (displayPrefs.sidebarCompact) {
      useUIStore.getState().toggleSidebarCollapse();
    }
  }, [displayPrefs.sidebarCompact]);

  // Listen to system theme changes
  useEffect(() => {
    if (selectedTheme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [selectedTheme]);

  // --- Handlers ---
  const handleSaveProfile = () => {
    profileSave.trigger(() => {
      settings.updateProfile(profileForm);
      updateSettingsMutation.mutate({ profile: profileForm });
    });
  };

  const handleSaveSocial = () => {
    socialSave.trigger(() => {
      settings.updateSocialLinks(socialForm);
      updateSettingsMutation.mutate({ socialLinks: socialForm });
    });
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    if (!passwordForm.current) {
      setPasswordError('Entrez votre mot de passe actuel');
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caracteres');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    passwordSave.trigger(() => {
      // Would call API: authApi.changePassword(passwordForm.current, passwordForm.newPass)
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    });
  };

  const handleSaveSeo = () => {
    seoSave.trigger(() => {
      settings.updateSeo(seoForm);
      updateSettingsMutation.mutate({ seo: seoForm });
    });
  };

  const handleSaveChatbot = () => {
    chatbotSave.trigger(() => {
      settings.updateChatbot(chatbotForm);
      updateSettingsMutation.mutate({ chatbot: chatbotForm });
    });
  };

  const handleAddQuickAction = () => {
    const newId = String(Date.now());
    setChatbotForm({
      ...chatbotForm,
      quickActions: [...chatbotForm.quickActions, { id: newId, label: '', prompt: '' }],
    });
  };

  const handleRemoveQuickAction = (id: string) => {
    setChatbotForm({
      ...chatbotForm,
      quickActions: chatbotForm.quickActions.filter((a) => a.id !== id),
    });
  };

  const handleUpdateQuickAction = (id: string, field: keyof ChatbotQuickAction, value: string) => {
    setChatbotForm({
      ...chatbotForm,
      quickActions: chatbotForm.quickActions.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  };

  const handleToggleDisplay = (key: keyof typeof displayPrefs) => {
    const updated = { ...displayPrefs, [key]: !displayPrefs[key] };
    setDisplayPrefs(updated);
    settings.updateDisplay(updated);
    toast.success('Preference mise a jour');
  };

  const charCount = seoForm.metaDescription.length;
  const charStatus = charCount <= 160 ? 'success' : 'danger';

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Navigation */}
      <div className="lg:w-[220px] shrink-0">
        <nav className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-1.5 space-y-0.5 lg:sticky lg:top-8">
          {sectionList.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                activeSection === section.id
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              )}
            >
              <section.icon className="w-4 h-4 shrink-0" />
              <span>{section.label}</span>
            </button>
          ))}

          {/* Last saved indicator */}
          {settings.lastSaved && (
            <div className="px-3 pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400">
                Derniere sauvegarde :<br />
                {new Date(settings.lastSaved).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* ===== PROFILE ===== */}
        {activeSection === 'profile' && (
          <>
            <SectionCard title="Informations personnelles" description="Ces informations sont affichees sur votre portfolio.">
              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden ring-2 ring-zinc-200 dark:ring-zinc-700">
                      <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => {
                        const url = prompt('URL de la nouvelle photo de profil :', profileForm.avatar);
                        if (url) setProfileForm({ ...profileForm, avatar: url });
                      }}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profileForm.name}</p>
                    <p className="text-[12px] text-zinc-400">Cliquez sur l'icone pour changer</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Nom complet</FieldLabel>
                    <FieldInput value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <FieldInput value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} type="email" />
                  </div>
                  <div>
                    <FieldLabel>Titre professionnel</FieldLabel>
                    <FieldInput value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} />
                  </div>
                  <div>
                    <FieldLabel>Localisation</FieldLabel>
                    <FieldInput value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} />
                  </div>
                  <div>
                    <FieldLabel>Nom de la marque (Brand)</FieldLabel>
                    <FieldInput value={profileForm.brand} onChange={(e) => setProfileForm({ ...profileForm, brand: e.target.value })} placeholder="Ex: CREATIVE" />
                  </div>
                  <div>
                    <FieldLabel>Telephone</FieldLabel>
                    <FieldInput value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+228 00000000" />
                  </div>
                  <div>
                    <FieldLabel>Annees d'experience</FieldLabel>
                    <FieldInput value={profileForm.yearsExperience} onChange={(e) => setProfileForm({ ...profileForm, yearsExperience: e.target.value })} placeholder="Ex: 5+" />
                  </div>
                </div>

                <div>
                  <FieldLabel>Bio</FieldLabel>
                  <Textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="min-h-[80px] rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm resize-none"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">{profileForm.bio.length}/300 caracteres</p>
                </div>

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveProfile} loading={profileSave.saving} saved={profileSave.saved} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Liens sociaux" description="Vos profils sur les reseaux.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>GitHub</FieldLabel>
                  <FieldInput value={socialForm.github} onChange={(e) => setSocialForm({ ...socialForm, github: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div>
                  <FieldLabel>LinkedIn</FieldLabel>
                  <FieldInput value={socialForm.linkedin} onChange={(e) => setSocialForm({ ...socialForm, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <FieldLabel>Twitter / X</FieldLabel>
                  <FieldInput value={socialForm.twitter} onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })} placeholder="https://x.com/..." />
                </div>
                <div>
                  <FieldLabel>Site personnel</FieldLabel>
                  <FieldInput value={socialForm.website} onChange={(e) => setSocialForm({ ...socialForm, website: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <SaveButton onClick={handleSaveSocial} loading={socialSave.saving} saved={socialSave.saved} />
              </div>
            </SectionCard>
          </>
        )}

        {/* ===== SECURITY ===== */}
        {activeSection === 'security' && (
          <>
            <SectionCard title="Changer le mot de passe" description="Utilisez un mot de passe fort avec au moins 8 caracteres.">
              <div className="max-w-md space-y-4">
                <div>
                  <FieldLabel>Mot de passe actuel</FieldLabel>
                  <div className="relative">
                    <FieldInput
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      type="button"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <FieldLabel>Nouveau mot de passe</FieldLabel>
                  <FieldInput
                    type="password"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    placeholder="Au moins 8 caracteres"
                  />
                  {/* Strength indicator */}
                  {passwordForm.newPass.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => {
                        const strength = passwordForm.newPass.length >= 12 ? 4 : passwordForm.newPass.length >= 10 ? 3 : passwordForm.newPass.length >= 8 ? 2 : 1;
                        return (
                          <div
                            key={i}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-colors',
                              i <= strength
                                ? strength >= 4 ? 'bg-emerald-500' : strength >= 3 ? 'bg-blue-500' : strength >= 2 ? 'bg-amber-500' : 'bg-red-500'
                                : 'bg-zinc-200 dark:bg-zinc-800'
                            )}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <FieldLabel>Confirmer le mot de passe</FieldLabel>
                  <FieldInput
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="Retapez le nouveau mot de passe"
                  />
                  {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                    <p className="text-[11px] text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                {passwordError && (
                  <p className="text-[12px] text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{passwordError}</p>
                )}

                <div className="flex justify-end pt-2">
                  <SaveButton
                    onClick={handlePasswordChange}
                    label="Modifier le mot de passe"
                    loading={passwordSave.saving}
                    saved={passwordSave.saved}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Sessions actives" description="Gerez vos sessions connectees.">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">Session actuelle</p>
                      <p className="text-[11px] text-zinc-400">
                        {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Navigateur'} - {navigator.platform} - {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ===== APPEARANCE ===== */}
        {activeSection === 'appearance' && (
          <SectionCard title="Theme" description="Choisissez le theme de l'interface.">
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {([
                { id: 'light' as ThemeMode, label: 'Clair', icon: Sun, preview: 'bg-white border-zinc-200' },
                { id: 'dark' as ThemeMode, label: 'Sombre', icon: Moon, preview: 'bg-zinc-900 border-zinc-700' },
                { id: 'system' as ThemeMode, label: 'Systeme', icon: Monitor, preview: 'bg-gradient-to-r from-white to-zinc-900 border-zinc-300' },
              ]).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150',
                    selectedTheme === theme.id
                      ? 'border-zinc-900 dark:border-white'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  )}
                >
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center">
                      <Check className="w-3 h-3 text-white dark:text-zinc-900" />
                    </div>
                  )}
                  <div className={cn('w-full h-12 rounded-lg border', theme.preview)} />
                  <div className="flex items-center gap-1.5">
                    <theme.icon className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">{theme.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
              <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Preferences d'affichage</h4>
              <div className="space-y-1">
                {([
                  { key: 'animations' as const, label: 'Animations', desc: 'Transitions et animations de l\'interface' },
                  { key: 'sidebarCompact' as const, label: 'Sidebar compacte', desc: 'Reduire la barre laterale par defaut' },
                  { key: 'denseMode' as const, label: 'Mode dense', desc: 'Reduire l\'espacement entre les elements' },
                ]).map((pref) => (
                  <label key={pref.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <div>
                      <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{pref.label}</p>
                      <p className="text-[11px] text-zinc-400">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleDisplay(pref.key)}
                      className={cn(
                        'relative w-9 h-5 rounded-full transition-colors shrink-0 ml-4',
                        displayPrefs[pref.key] ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full transition-transform shadow-sm',
                          displayPrefs[pref.key] ? 'left-[18px]' : 'left-0.5'
                        )}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ===== SEO ===== */}
        {activeSection === 'seo' && (
          <>
            <SectionCard title="Metadonnees du site" description="Ces informations apparaissent dans les resultats de recherche.">
              <div className="space-y-4">
                <div>
                  <FieldLabel>Titre du site</FieldLabel>
                  <FieldInput value={seoForm.siteTitle} onChange={(e) => setSeoForm({ ...seoForm, siteTitle: e.target.value })} />
                  <p className="text-[11px] text-zinc-400 mt-1">{seoForm.siteTitle.length}/70 caracteres</p>
                </div>
                <div>
                  <FieldLabel>Meta description</FieldLabel>
                  <Textarea
                    value={seoForm.metaDescription}
                    onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                    className="min-h-[70px] rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm resize-none"
                  />
                  <p className={cn('text-[11px] mt-1', charStatus === 'success' ? 'text-emerald-500' : 'text-red-500')}>
                    {charCount}/160 caracteres {charCount > 160 && '(trop long)'}
                  </p>
                </div>
                <div>
                  <FieldLabel>Mots-cles</FieldLabel>
                  <FieldInput value={seoForm.keywords} onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })} />
                  <p className="text-[11px] text-zinc-400 mt-1">{seoForm.keywords.split(',').filter(Boolean).length} mots-cles</p>
                </div>

                {/* Live Google preview */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                  <p className="text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-wider">Apercu Google</p>
                  <div className="space-y-0.5">
                    <p className="text-blue-600 dark:text-blue-400 text-base font-medium truncate">
                      {seoForm.siteTitle || 'Titre du site'}
                    </p>
                    <p className="text-[12px] text-emerald-700 dark:text-emerald-500 truncate">
                      https://yaologan.dev
                    </p>
                    <p className="text-[13px] text-zinc-500 line-clamp-2">
                      {seoForm.metaDescription || 'Description du site...'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveSeo} loading={seoSave.saving} saved={seoSave.saved} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Open Graph" description="Images et donnees pour le partage sur les reseaux sociaux.">
              <div className="space-y-4">
                <div>
                  <FieldLabel>Image OG (1200x630)</FieldLabel>
                  <FieldInput
                    value={seoForm.ogImage}
                    onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })}
                    placeholder="https://yourdomain.com/og-image.png"
                  />
                  {seoForm.ogImage && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 max-w-sm">
                      <img src={seoForm.ogImage} alt="OG Preview" className="w-full h-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Titre OG</FieldLabel>
                    <FieldInput value={seoForm.ogTitle} onChange={(e) => setSeoForm({ ...seoForm, ogTitle: e.target.value })} />
                  </div>
                  <div>
                    <FieldLabel>Type</FieldLabel>
                    <select
                      value={seoForm.ogType}
                      onChange={(e) => setSeoForm({ ...seoForm, ogType: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"
                    >
                      <option value="website">website</option>
                      <option value="article">article</option>
                      <option value="profile">profile</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveSeo} loading={seoSave.saving} saved={seoSave.saved} />
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ===== CHATBOT ===== */}
        {activeSection === 'chatbot' && (
          <>
            <SectionCard title="Configuration du chatbot" description="Activez ou desactivez le chatbot et personnalisez son comportement.">
              <div className="space-y-6">
                {/* Enable/Disable toggle */}
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">Activer le chatbot</p>
                    <p className="text-[11px] text-zinc-400">Affiche le bouton chatbot sur le site public</p>
                  </div>
                  <button
                    onClick={() => setChatbotForm({ ...chatbotForm, enabled: !chatbotForm.enabled })}
                    className={cn(
                      'relative w-9 h-5 rounded-full transition-colors shrink-0 ml-4',
                      chatbotForm.enabled ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full transition-transform shadow-sm',
                        chatbotForm.enabled ? 'left-[18px]' : 'left-0.5'
                      )}
                    />
                  </button>
                </label>

                {/* Welcome message */}
                <div>
                  <FieldLabel>Message de bienvenue</FieldLabel>
                  <Textarea
                    value={chatbotForm.welcomeMessage}
                    onChange={(e) => setChatbotForm({ ...chatbotForm, welcomeMessage: e.target.value })}
                    className="min-h-[100px] rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm resize-none"
                    placeholder="Bonjour ! Comment puis-je vous aider ?"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">Supporte le Markdown (**gras**, *italique*, liens)</p>
                </div>

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveChatbot} loading={chatbotSave.saving} saved={chatbotSave.saved} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Actions rapides" description="Les boutons proposes en bas du chatbot pour guider les visiteurs.">
              <div className="space-y-3">
                {chatbotForm.quickActions.map((action, index) => (
                  <div key={action.id} className="flex items-start gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                    <GripVertical className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mt-2 shrink-0" />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>Label</FieldLabel>
                        <FieldInput
                          value={action.label}
                          onChange={(e) => handleUpdateQuickAction(action.id, 'label', e.target.value)}
                          placeholder="Ex: Mes Projets"
                        />
                      </div>
                      <div>
                        <FieldLabel>Message envoye</FieldLabel>
                        <FieldInput
                          value={action.prompt}
                          onChange={(e) => handleUpdateQuickAction(action.id, 'prompt', e.target.value)}
                          placeholder="Ex: Montre-moi tes projets"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveQuickAction(action.id)}
                      className="mt-6 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={handleAddQuickAction}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-center gap-2 text-[12px] font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter une action
                </button>

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveChatbot} loading={chatbotSave.saving} saved={chatbotSave.saved} />
                </div>
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}
