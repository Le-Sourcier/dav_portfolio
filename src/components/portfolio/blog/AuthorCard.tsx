import { Github, Linkedin, ExternalLink } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from 'react-i18next';

export function AuthorCard() {
  const profile = useProfile();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6 p-8 rounded-[2rem] bg-secondary/30 border border-border">
      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0">
        <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t('blogPost.aboutAuthor')}</p>
        <h4 className="text-lg font-black tracking-tight mb-1">{profile.name}</h4>
        <p className="text-sm text-muted-foreground font-medium mb-3">{profile.title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{profile.bio}</p>

        <div className="flex items-center gap-3 mt-4">
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
              <Github className="w-4 h-4" />
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
