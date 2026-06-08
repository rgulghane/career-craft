import "server-only";

import { randomUUID } from "node:crypto";
import {
  BlobServiceClient,
  type ContainerClient,
} from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { serverConfig } from "@/lib/config";

const globalForBlob = globalThis as unknown as {
  mentorPhotoContainer?: Promise<ContainerClient>;
};

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Image storage is not configured. Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME.",
    );
    this.name = "StorageNotConfiguredError";
  }
}

function blobServiceClient(): BlobServiceClient {
  const { connectionString, accountName } = serverConfig.azureStorage;

  if (connectionString) {
    return BlobServiceClient.fromConnectionString(connectionString);
  }
  if (accountName) {
    // Managed identity / workload identity — no secrets in env.
    return new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );
  }
  throw new StorageNotConfiguredError();
}

async function mentorPhotoContainer(): Promise<ContainerClient> {
  if (globalForBlob.mentorPhotoContainer) {
    return globalForBlob.mentorPhotoContainer;
  }

  globalForBlob.mentorPhotoContainer = (async () => {
    const service = blobServiceClient();
    const container = service.getContainerClient(serverConfig.azureStorage.containerName);
    // Idempotent; public blob access so the landing page can load images directly.
    await container.createIfNotExists({ access: "blob" });
    return container;
  })();

  try {
    return await globalForBlob.mentorPhotoContainer;
  } catch (err) {
    globalForBlob.mentorPhotoContainer = undefined;
    throw err;
  }
}

export function isStorageConfigured(): boolean {
  return serverConfig.azureStorage.configured;
}

/** Build the public URL for a blob, honouring an optional CDN base URL. */
function publicUrl(blobName: string, blobUrl: string): string {
  const base = serverConfig.azureStorage.publicBaseUrl;
  if (base) {
    return `${base}/${blobName}`;
  }
  return blobUrl;
}

export interface UploadedImage {
  url: string;
  blobName: string;
}

async function uploadImage(
  prefix: string,
  params: { data: Buffer; contentType: string; extension: string },
): Promise<UploadedImage> {
  const container = await mentorPhotoContainer();
  const blobName = `${prefix}/${randomUUID()}.${params.extension}`;
  const blockBlob = container.getBlockBlobClient(blobName);

  await blockBlob.uploadData(params.data, {
    blobHTTPHeaders: {
      blobContentType: params.contentType,
      blobCacheControl: "public, max-age=31536000, immutable",
    },
  });

  return { url: publicUrl(blobName, blockBlob.url), blobName };
}

/**
 * Upload a mentor photo to Azure Blob Storage and return its public URL.
 * The caller is responsible for validating size and MIME type beforehand.
 */
export async function uploadMentorPhoto(params: {
  data: Buffer;
  contentType: string;
  extension: string;
}): Promise<UploadedImage> {
  return uploadImage("mentors", params);
}

/**
 * Upload a company brand icon to Azure Blob Storage and return its public URL.
 * The caller is responsible for validating size and MIME type beforehand.
 */
export async function uploadCompanyLogo(params: {
  data: Buffer;
  contentType: string;
  extension: string;
}): Promise<UploadedImage> {
  return uploadImage("company-logos", params);
}
