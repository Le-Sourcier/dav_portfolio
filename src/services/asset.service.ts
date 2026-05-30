import path from "node:path";
import { Readable } from "node:stream";
import sharp from "sharp";
import { Client, FTPResponse } from "basic-ftp";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_SCOPES = new Set(["blog", "projects", "experiences", "general"]);

export type AssetScope = "blog" | "projects" | "experiences" | "general";

export type UploadedAsset = {
  url: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
};

function getScope(scope?: string): AssetScope {
  if (scope && ALLOWED_SCOPES.has(scope)) return scope as AssetScope;
  return "general";
}

function slugifyFilename(filename: string): string {
  const basename = path.parse(filename).name;
  const slug = basename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "asset";
}

function assertFtpConfigured(): void {
  if (!config.assets.ftpHost || !config.assets.ftpUser || !config.assets.ftpPassword) {
    throw new Error("FTP asset storage is not configured");
  }
}

function buildRemotePath(scope: AssetScope, originalName: string): string {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const name = `${slugifyFilename(originalName)}-${uuidv4()}.webp`;

  return path.posix.join(scope, year, month, name);
}

function buildPublicUrl(relativePath: string): string {
  const base = config.assets.publicBaseUrl.replace(/\/+$/, "");
  return `${base}/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Code de réponse FTP signalant un transfert complété avec succès.
 * Voir RFC 959 § 5.4 : 226 "Closing data connection. Requested file action successful."
 */
const FTP_TRANSFER_COMPLETE = 226;

/**
 * Pousse `buffer` vers le serveur FTP au chemin `relativePath`.
 *
 * Le code historique appelait `uploadFrom` puis fermait la connexion sans
 * inspecter la réponse — ce qui peut masquer des transferts incomplets quand
 * le serveur accepte le PUT mais ne persiste pas le fichier (jail mal
 * configurée, quota, mode passif négocié de travers). On vérifie maintenant
 * que le serveur renvoie bien le code "transfert terminé" et on confirme
 * l'existence via `size()` avant de considérer l'upload comme réussi.
 */
async function uploadBufferToFtp(relativePath: string, buffer: Buffer): Promise<void> {
  assertFtpConfigured();

  const client = new Client(30_000);
  // verbose suivi du logLevel applicatif — précieux pour diagnostiquer les
  // chroot/jail invisibles côté FileZilla quand un upload "réussit" mais que
  // le fichier finit dans un répertoire inattendu.
  client.ftp.verbose = config.logLevel === "debug";

  const uploadRoot = config.assets.ftpUploadDir.replace(/\/+$/, "") || "/";
  const remoteDir = path.posix.join(uploadRoot, path.posix.dirname(relativePath));
  const remoteFilename = path.posix.basename(relativePath);

  try {
    await client.access({
      host: config.assets.ftpHost,
      port: config.assets.ftpPort,
      user: config.assets.ftpUser,
      password: config.assets.ftpPassword,
      secure: config.assets.ftpSecure,
    });

    await client.ensureDir(remoteDir);
    const effectiveCwd = await client.pwd();
    logger.debug("FTP upload — pwd after ensureDir", {
      requestedDir: remoteDir,
      effectiveCwd,
      remoteFilename,
    });

    const uploadResponse: FTPResponse = await client.uploadFrom(
      Readable.from(buffer),
      remoteFilename,
    );

    if (uploadResponse.code !== FTP_TRANSFER_COMPLETE) {
      throw new Error(
        `FTP upload returned unexpected code ${uploadResponse.code}: ${uploadResponse.message}`,
      );
    }

    // Vérification post-transfert : certains serveurs FTP acceptent le STOR
    // sans réellement écrire le fichier (quota, droits, jail). `size()`
    // échoue avec une 5xx si le fichier n'est pas là, ce qui nous laisse
    // remonter une vraie erreur au lieu de signaler une fausse réussite.
    const remoteSize = await client.size(remoteFilename);
    if (remoteSize !== buffer.length) {
      throw new Error(
        `FTP upload size mismatch: expected ${buffer.length} bytes, server reports ${remoteSize}`,
      );
    }

    logger.info("FTP upload completed", {
      remotePath: path.posix.join(effectiveCwd, remoteFilename),
      bytes: remoteSize,
    });
  } catch (error) {
    logger.error("FTP upload failed", {
      remoteDir,
      remoteFilename,
      host: config.assets.ftpHost,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    client.close();
  }
}

export class AssetService {
  static validateFile(file?: Express.Multer.File): asserts file is Express.Multer.File {
    if (!file) {
      throw new Error("Image file is required");
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new Error("Only JPEG, PNG, WebP and AVIF images are allowed");
    }
  }

  static async uploadImage(file: Express.Multer.File | undefined, scope?: string): Promise<UploadedAsset> {
    this.validateFile(file);

    const assetScope = getScope(scope);
    const remotePath = buildRemotePath(assetScope, file.originalname);

    const processor = sharp(file.buffer, { failOn: "none" }).rotate();
    const metadata = await processor.metadata();
    const width = metadata.width && metadata.width > config.assets.maxWidth
      ? config.assets.maxWidth
      : metadata.width;

    const optimizedBuffer = await processor
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: config.assets.quality, effort: 4 })
      .toBuffer();

    await uploadBufferToFtp(remotePath, optimizedBuffer);

    const outputMetadata = await sharp(optimizedBuffer).metadata();

    return {
      url: buildPublicUrl(remotePath),
      filename: path.posix.basename(remotePath),
      path: remotePath,
      mimeType: "image/webp",
      size: optimizedBuffer.length,
      width: outputMetadata.width,
      height: outputMetadata.height,
    };
  }
}

export default AssetService;
