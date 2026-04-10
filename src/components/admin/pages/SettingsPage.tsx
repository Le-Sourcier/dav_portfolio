import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Lock, Palette, Globe, Sun, Moon, Monitor, Check, Camera, Shield, Eye, EyeOff, Loader2, CheckCircle2, Bot, Plus, Trash2, GripVertical, Code2, GraduationCap, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, applyTheme, setThemeClickOrigin, type ThemeMode, type ProfileData, type SocialLinks, type SeoData, type ChatbotSettings, type ChatbotQuickAction, type SkillsData, type EducationEntry } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { useUpdateSettings, useApiSettings } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cvData } from '@/data/cvData';
import { useTranslation } from 'react-i18next';
import { LangToggle } from '../shared/LangToggle';

type Section = 'profile' | 'security' | 'appearance' | 'seo' | 'chatbot' | 'expertise';

const sectionList: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'expertise', label: 'Expertise', icon: Code2 },
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
const VALID_SECTIONS: Section[] = ['profile', 'expertise', 'security', 'appearance', 'seo', 'chatbot'];

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const settings = useSettingsStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

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

  // --- Expertise ---
  const storeSkills = settings.skills ?? { frontend: [], backend: [], tools: [] };
  const storeEduItems = settings.education?.items ?? (Array.isArray(settings.education) ? settings.education as unknown as EducationEntry[] : []);
  const fallbackSkills: SkillsData = {
    frontend: storeSkills.frontend?.length > 0 ? storeSkills.frontend : cvData.skills.frontend,
    backend: storeSkills.backend?.length > 0 ? storeSkills.backend : cvData.skills.backend,
    tools: storeSkills.tools?.length > 0 ? storeSkills.tools : cvData.skills.tools,
  };
  const fallbackEducation: EducationEntry[] = storeEduItems.length > 0
    ? storeEduItems
    : cvData.education.map((edu, i) => ({ id: String(i + 1), ...edu }));

  const [skillsForm, setSkillsForm] = useState<SkillsData>(fallbackSkills);
  const [educationForm, setEducationForm] = useState<EducationEntry[]>(fallbackEducation);
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({ frontend: '', backend: '', tools: '' });
  const skillsSave = useSaveFeedback();
  const educationSave = useSaveFeedback();

  // --- API sync ---
  const updateSettingsMutation = useUpdateSettings();
  const { data: apiSettings } = useApiSettings();

  // Auto-seed: persist cvData fallbacks to DB if skills/education missing from API
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (seeded || !apiSettings) return;
    const needsSkills = !apiSettings.skills || !((apiSettings.skills as SkillsData).frontend?.length > 0);
    const needsEducation = !apiSettings.education || !(apiSettings.education as { items?: unknown[] }).items?.length;
    if (needsSkills || needsEducation) {
      const seedData: Record<string, unknown> = {};
      if (needsSkills) seedData.skills = fallbackSkills;
      if (needsEducation) seedData.education = { items: fallbackEducation };
      updateSettingsMutation.mutate(seedData as any);
      if (needsSkills) settings.updateSkills(fallbackSkills);
      if (needsEducation) settings.updateEducation({ items: fallbackEducation });
    }
    setSeeded(true);
  }, [apiSettings]);

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

  // --- Expertise handlers ---
  const handleAddSkill = (category: keyof SkillsData) => {
    const skill = newSkillInputs[category].trim();
    if (!skill || skillsForm[category].includes(skill)) return;
    setSkillsForm({ ...skillsForm, [category]: [...skillsForm[category], skill] });
    setNewSkillInputs({ ...newSkillInputs, [category]: '' });
  };

  const handleRemoveSkill = (category: keyof SkillsData, index: number) => {
    setSkillsForm({
      ...skillsForm,
      [category]: skillsForm[category].filter((_, i) => i !== index),
    });
  };

  const handleSaveSkills = () => {
    skillsSave.trigger(() => {
      settings.updateSkills(skillsForm);
      updateSettingsMutation.mutate({ skills: skillsForm });
    });
  };

  const handleAddEducation = () => {
    const newId = String(Date.now());
    setEducationForm([...educationForm, { id: newId, degree: '', degree_en: '', field: '', field_en: '', description: '', description_en: '' }]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducationForm(educationForm.filter((e) => e.id !== id));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducationForm(educationForm.map((e) => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSaveEducation = () => {
    educationSave.trigger(() => {
      const data = { items: educationForm };
      settings.updateEducation(data);
      updateSettingsMutation.mutate({ education: data });
    });
  };

  const handleToggleDisplay = (key: keyof typeof displayPrefs) => {
    const updated = { ...displayPrefs, [key]: !displayPrefs[key] };
    setDisplayPrefs(updated);
    settings.updateDisplay(updated);
    toast.success('Preference mise a jour');
  };

  const charCount = (lang === 'fr' ? seoForm.metaDescription : seoForm.metaDescription_en ?? '').length;
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
            <SectionCard title={t('settings.profile.personalInfo')} description={t('settings.profile.personalInfoDesc')}>
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
                    <p className="text-[12px] text-zinc-400">{t('settings.profile.changePhoto')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>{t('settings.profile.fullName')}</FieldLabel>
                    <FieldInput value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div>
                    <FieldLabel>{t('settings.profile.email')}</FieldLabel>
                    <FieldInput value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} type="email" />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <FieldLabel>{t('settings.profile.professionalTitle')}</FieldLabel>
                      <LangToggle lang={lang} onChange={setLang} hasEnContent={!!profileForm.title_en} />
                    </div>
                    <FieldInput 
                      value={lang === 'fr' ? profileForm.title : profileForm.title_en} 
                      onChange={(e) => setProfileForm({ 
                        ...profileForm, 
                        [lang === 'fr' ? 'title' : 'title_en']: e.target.value 
                      })} 
                    />
                  </div>
                  <div>
                    <FieldLabel>{t('settings.profile.location')}</FieldLabel>
                    <FieldInput value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <FieldLabel>{t('settings.profile.locationSuffix')}</FieldLabel>
                      <LangToggle lang={lang} onChange={setLang} hasEnContent={!!profileForm.locationSuffix_en} />
                    </div>
                    <FieldInput 
                      value={lang === 'fr' ? profileForm.locationSuffix : profileForm.locationSuffix_en} 
                      onChange={(e) => setProfileForm({ 
                        ...profileForm, 
                        [lang === 'fr' ? 'locationSuffix' : 'locationSuffix_en']: e.target.value 
                      })} 
                      placeholder={t('settings.profile.locationSuffixPlaceholder')}
                    />
                  </div>
                  <div>
                    <FieldLabel>{t('settings.profile.brandName')}</FieldLabel>
                    <FieldInput value={profileForm.brand} onChange={(e) => setProfileForm({ ...profileForm, brand: e.target.value })} placeholder={t('settings.profile.brandPlaceholder')} />
                  </div>
                  <div>
                    <FieldLabel>{t('settings.profile.phone')}</FieldLabel>
                    <FieldInput value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder={t('settings.profile.phonePlaceholder')} />
                  </div>
                  <div>
                    <FieldLabel>{t('settings.profile.yearsExperience')}</FieldLabel>
                    <FieldInput value={profileForm.yearsExperience} onChange={(e) => setProfileForm({ ...profileForm, yearsExperience: e.target.value })} placeholder={t('settings.profile.yearsPlaceholder')} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FieldLabel>{t('settings.profile.bio')}</FieldLabel>
                    <LangToggle lang={lang} onChange={setLang} hasEnContent={!!profileForm.bio_en} />
                  </div>
                  <Textarea
                    value={lang === 'fr' ? profileForm.bio : profileForm.bio_en}
                    onChange={(e) => setProfileForm({ 
                      ...profileForm, 
                      [lang === 'fr' ? 'bio' : 'bio_en']: e.target.value 
                    })}
                    className="min-h-[80px] rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm resize-none"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">{(lang === 'fr' ? profileForm.bio : profileForm.bio_en ?? '').length}{t('settings.profile.bioCount')}</p>
                </div>

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveProfile} loading={profileSave.saving} saved={profileSave.saved} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t('settings.profile.socialLinks')} description={t('settings.profile.socialLinksDesc')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>{t('settings.profile.github')}</FieldLabel>
                  <FieldInput value={socialForm.github} onChange={(e) => setSocialForm({ ...socialForm, github: e.target.value })} placeholder={t('settings.profile.githubPlaceholder')} />
                </div>
                <div>
                  <FieldLabel>{t('settings.profile.linkedin')}</FieldLabel>
                  <FieldInput value={socialForm.linkedin} onChange={(e) => setSocialForm({ ...socialForm, linkedin: e.target.value })} placeholder={t('settings.profile.linkedinPlaceholder')} />
                </div>
                <div>
                  <FieldLabel>{t('settings.profile.twitter')}</FieldLabel>
                  <FieldInput value={socialForm.twitter} onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })} placeholder={t('settings.profile.twitterPlaceholder')} />
                </div>
                <div>
                  <FieldLabel>{t('settings.profile.website')}</FieldLabel>
                  <FieldInput value={socialForm.website} onChange={(e) => setSocialForm({ ...socialForm, website: e.target.value })} placeholder={t('settings.profile.websitePlaceholder')} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <SaveButton onClick={handleSaveSocial} loading={socialSave.saving} saved={socialSave.saved} />
              </div>
            </SectionCard>
          </>
        )}

        {/* ===== EXPERTISE ===== */}
        {activeSection === 'expertise' && (
          <>
            <SectionCard title={t('settings.expertise.skills')} description={t('settings.expertise.skillsDesc')}>
              <div className="space-y-6">
                {(['frontend', 'backend', 'tools'] as const).map((category) => {
                  const labels = { frontend: t('settings.expertise.frontend'), backend: t('settings.expertise.backend'), tools: t('settings.expertise.tools') };
                  return (
                    <div key={category}>
                      <FieldLabel>{labels[category]}</FieldLabel>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {skillsForm[category].map((skill, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {skill}
                            <button
                              onClick={() => handleRemoveSkill(category, i)}
                              className="ml-0.5 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <FieldInput
                          value={newSkillInputs[category]}
                          onChange={(e) => setNewSkillInputs({ ...newSkillInputs, [category]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(category); } }}
                          placeholder={t('settings.expertise.addSkill')}
                          className="flex-1"
                        />
                        <button
                          onClick={() => handleAddSkill(category)}
                          className="h-9 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveSkills} loading={skillsSave.saving} saved={skillsSave.saved} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t('settings.expertise.education')} description={t('settings.expertise.educationDesc')}>
              <div className="space-y-3">
                {educationForm.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <FieldLabel>{t('settings.expertise.degree')}</FieldLabel>
                            <LangToggle lang={lang} onChange={setLang} hasEnContent={!!edu.degree_en} />
                          </div>
                          <FieldInput
                            value={lang === 'fr' ? edu.degree : edu.degree_en}
                            onChange={(e) => handleUpdateEducation(edu.id, lang === 'fr' ? 'degree' : 'degree_en', e.target.value)}
                            placeholder={t('settings.expertise.degreePlaceholder')}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <FieldLabel>{t('settings.expertise.field')}</FieldLabel>
                            <LangToggle lang={lang} onChange={setLang} hasEnContent={!!edu.field_en} />
                          </div>
                          <FieldInput
                            value={lang === 'fr' ? edu.field : edu.field_en}
                            onChange={(e) => handleUpdateEducation(edu.id, lang === 'fr' ? 'field' : 'field_en', e.target.value)}
                            placeholder={t('settings.expertise.fieldPlaceholder')}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <FieldLabel>{t('settings.expertise.description')}</FieldLabel>
                            <LangToggle lang={lang} onChange={setLang} hasEnContent={!!edu.description_en} />
                          </div>
                          <FieldInput
                            value={lang === 'fr' ? edu.description : edu.description_en}
                            onChange={(e) => handleUpdateEducation(edu.id, lang === 'fr' ? 'description' : 'description_en', e.target.value)}
                            placeholder={t('settings.expertise.descriptionPlaceholder')}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="mt-5 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddEducation}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-center gap-2 text-[12px] font-medium"
                >
                  <GraduationCap className="w-3.5 h-3.5" /> {t('settings.expertise.addFormation')}
                </button>

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveEducation} loading={educationSave.saving} saved={educationSave.saved} />
                </div>
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
                  onClick={(e) => { setThemeClickOrigin(e.clientX, e.clientY); setSelectedTheme(theme.id); }}
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
            <SectionCard title={t('settings.seo.metadata')} description={t('settings.seo.metadataDesc')}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FieldLabel>{t('settings.seo.siteTitle')}</FieldLabel>
                    <LangToggle lang={lang} onChange={setLang} hasEnContent={!!seoForm.siteTitle_en} />
                  </div>
                  <FieldInput 
                    value={lang === 'fr' ? seoForm.siteTitle : (seoForm.siteTitle_en ?? '')} 
                    onChange={(e) => setSeoForm({ 
                      ...seoForm, 
                      [lang === 'fr' ? 'siteTitle' : 'siteTitle_en']: e.target.value 
                    })} 
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">{(lang === 'fr' ? seoForm.siteTitle : seoForm.siteTitle_en ?? '').length}/70 caracteres</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FieldLabel>{t('settings.seo.metaDescription')}</FieldLabel>
                    <LangToggle lang={lang} onChange={setLang} hasEnContent={!!seoForm.metaDescription_en} />
                  </div>
                  <Textarea
                    value={lang === 'fr' ? seoForm.metaDescription : (seoForm.metaDescription_en ?? '')}
                    onChange={(e) => setSeoForm({ 
                      ...seoForm, 
                      [lang === 'fr' ? 'metaDescription' : 'metaDescription_en']: e.target.value 
                    })}
                    className="min-h-[70px] rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm resize-none"
                  />
                  <p className={cn('text-[11px] mt-1', charStatus === 'success' ? 'text-emerald-500' : 'text-red-500')}>
                    {(lang === 'fr' ? seoForm.metaDescription : seoForm.metaDescription_en ?? '').length}/160 caracteres {(lang === 'fr' ? seoForm.metaDescription : seoForm.metaDescription_en ?? '').length > 160 && '(trop long)'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FieldLabel>{t('settings.seo.keywords')}</FieldLabel>
                    <LangToggle lang={lang} onChange={setLang} hasEnContent={!!seoForm.keywords_en} />
                  </div>
                  <FieldInput 
                    value={lang === 'fr' ? seoForm.keywords : (seoForm.keywords_en ?? '')} 
                    onChange={(e) => setSeoForm({ 
                      ...seoForm, 
                      [lang === 'fr' ? 'keywords' : 'keywords_en']: e.target.value 
                    })} 
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">{(lang === 'fr' ? seoForm.keywords : seoForm.keywords_en ?? '').split(',').filter(Boolean).length} mots-cles</p>
                </div>

                {/* Live Google preview */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                  <p className="text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-wider">{t('settings.seo.googlePreview')}</p>
                  <div className="space-y-0.5">
                    <p className="text-blue-600 dark:text-blue-400 text-base font-medium truncate">
                      {(lang === 'fr' ? seoForm.siteTitle : (seoForm.siteTitle_en ?? '')) || (lang === 'fr' ? 'Titre du site' : 'Site title')}
                    </p>
                    <p className="text-[12px] text-emerald-700 dark:text-emerald-500 truncate">
                      https://yaologan.dev
                    </p>
                    <p className="text-[13px] text-zinc-500 line-clamp-2">
                      {(lang === 'fr' ? seoForm.metaDescription : (seoForm.metaDescription_en ?? '')) || (lang === 'fr' ? 'Description du site...' : 'Site description...')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveSeo} loading={seoSave.saving} saved={seoSave.saved} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t('settings.seo.openGraph')} description={t('settings.seo.openGraphDesc')}>
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
            <SectionCard title={t('settings.chatbot.config')} description={t('settings.chatbot.configDesc')}>
              <div className="space-y-6">
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{t('settings.chatbot.enableChatbot')}</p>
                    <p className="text-[11px] text-zinc-400">{t('settings.chatbot.enableChatbotDesc')}</p>
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

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FieldLabel>{t('settings.chatbot.welcomeMessage')}</FieldLabel>
                    <LangToggle lang={lang} onChange={setLang} hasEnContent={!!chatbotForm.welcomeMessage_en} />
                  </div>
                  <Textarea
                    value={lang === 'fr' ? chatbotForm.welcomeMessage : chatbotForm.welcomeMessage_en}
                    onChange={(e) => setChatbotForm({ 
                      ...chatbotForm, 
                      [lang === 'fr' ? 'welcomeMessage' : 'welcomeMessage_en']: e.target.value 
                    })}
                    className="min-h-[100px] rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm resize-none"
                    placeholder={t('settings.chatbot.welcomeMessagePlaceholder')}
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">{t('settings.chatbot.welcomeMessageHint')}</p>
                </div>

                <div className="flex justify-end pt-2">
                  <SaveButton onClick={handleSaveChatbot} loading={chatbotSave.saving} saved={chatbotSave.saved} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t('settings.chatbot.quickActions')} description={t('settings.chatbot.quickActionsDesc')}>
              <div className="space-y-3">
                {chatbotForm.quickActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                    <GripVertical className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mt-2 shrink-0" />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <FieldLabel>{t('settings.chatbot.label')}</FieldLabel>
                          <LangToggle lang={lang} onChange={setLang} hasEnContent={!!action.label_en} />
                        </div>
                        <FieldInput
                          value={lang === 'fr' ? action.label : action.label_en}
                          onChange={(e) => handleUpdateQuickAction(action.id, lang === 'fr' ? 'label' : 'label_en', e.target.value)}
                          placeholder={t('settings.chatbot.labelPlaceholder')}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <FieldLabel>{t('settings.chatbot.messageSent')}</FieldLabel>
                          <LangToggle lang={lang} onChange={setLang} hasEnContent={!!action.prompt_en} />
                        </div>
                        <FieldInput
                          value={lang === 'fr' ? action.prompt : action.prompt_en}
                          onChange={(e) => handleUpdateQuickAction(action.id, lang === 'fr' ? 'prompt' : 'prompt_en', e.target.value)}
                          placeholder={t('settings.chatbot.messageSentPlaceholder')}
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
                  <Plus className="w-3.5 h-3.5" /> {t('settings.chatbot.addAction')}
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
