import path from "node:path";
import { Readable } from "node:stream";
import sharp from "sharp";
import { Client } from "basic-ftp";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/index.js";

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

async function uploadBufferToFtp(relativePath: string, buffer: Buffer): Promise<void> {
  assertFtpConfigured();

  const client = new Client(30_000);
  client.ftp.verbose = false;

  try {
    await client.access({
      host: config.assets.ftpHost,
      port: config.assets.ftpPort,
      user: config.assets.ftpUser,
      password: config.assets.ftpPassword,
      secure: config.assets.ftpSecure,
    });

    const uploadRoot = config.assets.ftpUploadDir.replace(/\/+$/, "") || "/";
    const remoteDir = path.posix.join(uploadRoot, path.posix.dirname(relativePath));
    const remoteFilename = path.posix.basename(relativePath);

    await client.ensureDir(remoteDir);
    await client.uploadFrom(Readable.from(buffer), remoteFilename);
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
