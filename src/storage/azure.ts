import type { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

/**
 * Returns a blob storage client.
 *
 * @param {string} [connection] The custom suffix of the connection.
 *
 * @returns {BlobServiceClient} The new client.
 */
export function getAzureBlobStorageClient(connection = '1'): BlobServiceClient {
    const envVar = `AZURE_STORAGE_CONNECTION_${connection}`;

    const AZURE_STORAGE_CONNECTION = process.env[envVar]?.trim();
    if (!AZURE_STORAGE_CONNECTION?.length) {
        throw new Error(`No ${envVar} defined`);
    }

    return require('@azure/storage-blob').BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION
    );
}

/**
 * Returns a blob storage container client.
 *
 * @param {string} [connection] The custom suffix of the connection.
 * @param {string} [container] The custom name of the container.
 *
 * @returns {ContainerClient} The new client.
 */
export function getAzureBlobStorageContainerClient(connection = '1', container?: string): ContainerClient {
    if (arguments.length < 2) {
        const envVar = `AZURE_STORAGE_CONNECTION_${connection}_CONTAINER`;

        const AZURE_STORAGE_CONNECTION_CONTAINER = process.env[envVar]?.trim();
        if (!AZURE_STORAGE_CONNECTION_CONTAINER?.length) {
            throw new Error(`No ${envVar} defined`);
        }

        container = AZURE_STORAGE_CONNECTION_CONTAINER;
    }

    if (!container?.trim().length) {
        throw new Error('No container specified');
    }

    return getAzureBlobStorageClient(connection)
        .getContainerClient(container);
}
