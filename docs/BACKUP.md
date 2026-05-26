# Backup System — Portfolio Backend

Système de backup automatique pour la base PostgreSQL, les logs et (futur) les
uploads du backend Portfolio. Conçu pour tourner via **crontab système** sur
un VPS classique (Linux, Node 20, PostgreSQL).

---

## 1. Périmètre

| Source | Fichier produit | Activé par défaut ? |
|---|---|---|
| PostgreSQL (`pg_dump --format=custom`) | `portfolio-db-<stamp>.dump` | ✅ |
| `backend/logs/` (tarball) | `portfolio-logs-<stamp>.tar.gz` | ✅ |
| `BACKUP_UPLOADS_PATH` (tarball) | `portfolio-uploads-<stamp>.tar.gz` | ❌ (`BACKUP_INCLUDE_UPLOADS=false`) |
| Manifest SHA-256 | `portfolio-<stamp>.manifest.txt` | ✅ |

Rotation **tiered** par défaut :

| Tier | Quand | Combien on garde |
|---|---|---|
| `daily` | tous les jours (sauf weekly/monthly) | 7 |
| `weekly` | chaque dimanche | 4 |
| `monthly` | le 1er de chaque mois | 3 |

→ rétention totale ≈ 14 backups (7 + 4 + 3), priorité monthly > weekly > daily.

---

## 2. Quick start (backup local seulement, 3 commandes)

```bash
cd backend

# 1) activer
echo "BACKUP_ENABLED=true" >> .env

# 2) tester
npm run backup:test

# 3) ajouter au crontab (voir section 4)
crontab -e
# puis coller la ligne de la section 4
```

Vérification :

```bash
ls -lh backups/daily/
cat logs/backup.log | tail
sha256sum -c backups/daily/portfolio-*-*.manifest.txt
```

---

## 3. Variables d'environnement

Toutes documentées dans `backend/.env.example` (section `# === Backup ===`).
Résumé :

| Variable | Défaut | Effet |
|---|---|---|
| `BACKUP_ENABLED` | `false` | master switch |
| `BACKUP_RETENTION_DAILY` | `7` | nb fichiers daily gardés |
| `BACKUP_RETENTION_WEEKLY` | `4` | nb fichiers weekly gardés |
| `BACKUP_RETENTION_MONTHLY` | `3` | nb fichiers monthly gardés |
| `BACKUP_INCLUDE_LOGS` | `true` | tarball de `logs/` |
| `BACKUP_INCLUDE_UPLOADS` | `false` | tarball de `BACKUP_UPLOADS_PATH` |
| `BACKUP_UPLOADS_PATH` | `./uploads` | dossier à archiver si activé |
| `BACKUP_NOTIFY_EMAIL` | _vide_ | si rempli + SMTP OK, email sur échec |
| `BACKUP_NOTIFY_DISCORD_WEBHOOK` | _vide_ | si rempli, embed Discord sur échec |
| `BACKUP_VERBOSE_NOTIFY` | `false` | si `true`, notifie aussi sur succès |

Variables DB (réutilisées) : `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`.

Variables SMTP (réutilisées) : `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`.

---

## 4. Crontab système

Édition :

```bash
crontab -e
```

Ligne à ajouter (adapter le chemin absolu) :

```cron
# Portfolio backup — chaque jour à 03:17 (off-peak, minute non-ronde)
17 3 * * * cd /var/www/portfolio/backend && /bin/bash scripts/backup.sh >> logs/backup-cron.log 2>&1
```

Vérification :

```bash
crontab -l | grep backup.sh
tail -f /var/www/portfolio/backend/logs/backup-cron.log
```

Pourquoi `03:17` plutôt que `03:00` : éviter de partager la même minute que tous
les crontabs ronds du monde — réduit la contention I/O sur les VPS mutualisés.

---

## 5. Destinations distantes (optionnelles)

Chaque destination est **activée si et seulement si sa variable principale est
non-vide**. L'échec d'une destination ne casse pas le backup local.

### 5.1 S3-compatible (AWS S3, Cloudflare R2, Backblaze B2, MinIO, Wasabi)

**Prérequis** : `aws` CLI installé.

```bash
# Ubuntu/Debian
sudo apt install awscli
# ou via pip
pip install awscli
```

**Config `.env`** :

```bash
BACKUP_S3_BUCKET=mon-bucket-backup
BACKUP_S3_REGION=auto                         # 'auto' pour R2/B2, 'eu-west-3' pour AWS, etc.
BACKUP_S3_ENDPOINT=https://<acc>.r2.cloudflarestorage.com   # vide pour AWS S3 natif
BACKUP_S3_ACCESS_KEY_ID=...
BACKUP_S3_SECRET_ACCESS_KEY=...
BACKUP_S3_PREFIX=portfolio-backups
```

**IAM minimum AWS** :

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"],
    "Resource": ["arn:aws:s3:::mon-bucket-backup", "arn:aws:s3:::mon-bucket-backup/*"]
  }]
}
```

**Cloudflare R2** : créer un bucket, puis "Manage R2 API tokens" → "Object Read & Write".
L'endpoint a la forme `https://<account_id>.r2.cloudflarestorage.com`.

**Backblaze B2** : créer un Application Key avec `readWrite` sur le bucket.
Endpoint : `https://s3.<region>.backblazeb2.com`.

### 5.2 SFTP

**Prérequis** : `openssh-client` (présent par défaut). Pour auth par mot de passe : `sshpass`.

```bash
sudo apt install openssh-client sshpass
```

**Auth recommandée : clé SSH** (sécurité + pas de prompt) :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/portfolio_backup -N ""
ssh-copy-id -i ~/.ssh/portfolio_backup user@backup.example.com
```

**Config `.env`** :

```bash
BACKUP_SFTP_HOST=backup.example.com
BACKUP_SFTP_PORT=22
BACKUP_SFTP_USER=backup-user
BACKUP_SFTP_KEY_PATH=/home/deploy/.ssh/portfolio_backup
BACKUP_SFTP_REMOTE_DIR=/srv/backups/portfolio
```

Ou (déconseillé, à n'utiliser que si pas de clé possible) :

```bash
BACKUP_SFTP_PASSWORD=...
```

### 5.3 Google Drive (via rclone)

**Prérequis** : installer rclone et configurer un remote.

```bash
curl https://rclone.org/install.sh | sudo bash
rclone config
# → New remote → name: gdrive
# → Storage: drive
# → client_id / secret : laisser vide (utilise les credentials rclone par défaut, OK pour usage perso)
# → scope: drive.file  (recommandé — accès aux seuls fichiers créés par rclone)
# → Authentification : si serveur headless, copier l'URL d'auth dans un navigateur local
```

**Test** :

```bash
rclone ls gdrive:
```

**Config `.env`** :

```bash
BACKUP_GDRIVE_RCLONE_REMOTE=gdrive
BACKUP_GDRIVE_REMOTE_DIR=portfolio-backups
```

---

## 6. Restauration

### 6.1 Lister le contenu d'un dump

```bash
pg_restore --list backups/daily/portfolio-db-2026-05-26-0317.dump | head -40
```

### 6.2 Restore complet sur DB neuve

```bash
# 1) Créer une DB cible
createdb -h localhost -U postgres portfolio_db_restore

# 2) Dry-run pour valider
pg_restore --dry-run \
  -h localhost -U postgres -d portfolio_db_restore \
  backups/daily/portfolio-db-2026-05-26-0317.dump

# 3) Restore réel
pg_restore --clean --if-exists --no-owner --no-acl \
  -h localhost -U postgres -d portfolio_db_restore \
  backups/daily/portfolio-db-2026-05-26-0317.dump

# 4) Vérification
psql -h localhost -U postgres -d portfolio_db_restore -c "SELECT COUNT(*) FROM projects;"
```

### 6.3 Restaurer une seule table

```bash
pg_restore --table=projects --data-only \
  -h localhost -U postgres -d portfolio_db \
  backups/daily/portfolio-db-2026-05-26-0317.dump
```

### 6.4 Logs / uploads

```bash
tar -xzf backups/daily/portfolio-logs-2026-05-26-0317.tar.gz -C /tmp/restore/
# puis copier les fichiers utiles
```

---

## 7. Intégrité

Chaque tier embarque un manifest avec SHA-256 de chaque fichier :

```bash
cd backups/daily
sha256sum -c portfolio-2026-05-26-0317.manifest.txt
# → portfolio-db-2026-05-26-0317.dump: OK
# → portfolio-logs-2026-05-26-0317.tar.gz: OK
```

---

## 8. Troubleshooting

| Symptôme | Cause probable | Fix |
|---|---|---|
| `pg_dump: command not found` | `postgresql-client` non installé | `sudo apt install postgresql-client` |
| `pg_dump: error: connection failed` | DB_HOST/PORT/PASSWORD faux | Vérifier `.env`, tester avec `psql` |
| `aws: command not found` | CLI non installé | `pip install awscli` ou `apt install awscli` |
| `Permission denied` sur `backups/` | Crontab tourne sous user différent | `chown -R deploy:deploy backend/backups` |
| Rotation laisse trop de fichiers | Backups mixés daily/weekly/monthly dans le mauvais dossier | Vérifier que la date du système est correcte (`timedatectl`) |
| Emails non reçus | SMTP creds vides ou bloquées (Gmail App Password) | Tester avec `npm run dev` (le mailer principal logue `Email server connection verified` au boot) |
| `rclone copy` lent | Quota Google Drive ou large fichier | rclone gère le throttling auto ; vérifier `rclone about gdrive:` |

---

## 9. Sécurité

- `.env` (avec credentials S3, SFTP, etc.) est **ignoré par git** — ne jamais commit.
- `backups/` est **ignoré par git** — évite de pousser des données prod.
- Les scripts utilisent `set -euo pipefail` et `set +x` pour ne pas leak les credentials dans les traces.
- `PGPASSWORD` est exporté localement puis `unset` à la fin du script.
- Permissions recommandées sur les scripts : `chmod 700 backend/scripts/backup*.sh`.
- Sur un serveur de backup distant, créer un user dédié avec accès en écriture **seulement** au dossier de backup (pas de shell).

---

## 10. Hors-scope volontaire

- **Pas de chiffrement GPG des dumps** — à ajouter en V2 si besoin (variable `BACKUP_GPG_RECIPIENT`).
- **Pas de WAL archiving / PITR** — overkill tant que la DB < 5 Go.
- **Pas d'UI admin** — toute la config passe par `.env` (les secrets cloud n'ont rien à faire dans l'admin web).
- **Pas de WhatsApp/Telegram** — email + Discord couvrent.

---

## 11. Fichiers du système

```
backend/scripts/
├── backup.sh                  # orchestrateur principal
├── notify-wrapper.sh          # bash → tsx (isolation des erreurs Node)
├── backup-notify.ts           # envoi email + Discord
├── backup-upload-s3.sh        # uploader S3-compatible
├── backup-upload-sftp.sh      # uploader SFTP
└── backup-upload-gdrive.sh    # uploader Google Drive (rclone)

backend/backups/               # créé au runtime, ignoré par git
├── daily/
├── weekly/
└── monthly/

backend/logs/
├── backup.log                 # logs structurés du backup
└── backup-cron.log            # stdout/stderr du crontab
```
