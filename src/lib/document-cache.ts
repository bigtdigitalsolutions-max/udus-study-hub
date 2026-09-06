export type CachedDocumentPage = {
  page: number;
  totalPages: number;
  width: number;
  height: number;
  blob: Blob;
};

type CachedPageRecord = CachedDocumentPage & {
  key: string;
  documentId: string;
  courseCode: string;
  department: string | null;
  updatedAt: number;
};

const DB_NAME = "udus-study-vault-reader";
const DB_VERSION = 1;
const STORE_NAME = "rendered-pages";

function openCache(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => resolve(null);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function pageKey(documentId: string, page: number) {
  return `${documentId}:${page}`;
}

export async function cacheRenderedPage(
  documentId: string,
  courseCode: string,
  department: string | null,
  page: CachedDocumentPage,
) {
  const database = await openCache();
  if (!database) return;

  await new Promise<void>((resolve) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({
      ...page,
      key: pageKey(documentId, page.page),
      documentId,
      courseCode,
      department,
      updatedAt: Date.now(),
    } satisfies CachedPageRecord);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => resolve();
    transaction.onabort = () => resolve();
  });
  database.close();
}

export async function getCachedPages(documentId: string): Promise<CachedDocumentPage[]> {
  const database = await openCache();
  if (!database) return [];

  const records = await new Promise<CachedPageRecord[]>((resolve) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(
      (request.result as CachedPageRecord[]).filter((record) => record.documentId === documentId),
    );
    request.onerror = () => resolve([]);
  });
  database.close();
  return records.sort((a, b) => a.page - b.page).map(({ page, totalPages, width, height, blob }) => ({
    page,
    totalPages,
    width,
    height,
    blob,
  }));
}

export async function findCachedDocument(courseCode: string): Promise<{
  documentId: string;
  department: string | null;
} | null> {
  const database = await openCache();
  if (!database) return null;

  const result = await new Promise<CachedPageRecord | null>((resolve) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const records = request.result as CachedPageRecord[];
      resolve(
        records
          .filter((record) => record.courseCode.toLowerCase() === courseCode.toLowerCase())
          .sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null,
      );
    };
    request.onerror = () => resolve(null);
  });
  database.close();
  return result ? { documentId: result.documentId, department: result.department } : null;
}