import { readFile } from 'fs/promises';
import { extname } from 'path';
import { Document } from '@langchain/core/documents';

const loaderCache = new Map<string, unknown>();

async function getPdfLoader() {
  if (!loaderCache.has('pdf')) {
    try {
      // runtime dynamic import to avoid bundler static resolution
      // use Function constructor to call import at runtime only
      // @ts-ignore
      const dynamicImport: (s: string) => Promise<any> = new Function('s', 'return import(s)') as any;
      const pkg = await dynamicImport('@langchain/community');
      const PDFLoader = pkg?.document_loaders?.fs?.pdf?.PDFLoader ?? pkg?.PDFLoader ?? pkg?.pdf?.PDFLoader;
      if (!PDFLoader) throw new Error('PDF loader not exported');
      loaderCache.set('pdf', PDFLoader);
    } catch {
      throw new Error('PDF loader not available. Install @langchain/community.');
    }
  }
  return loaderCache.get('pdf');
}

async function getDocxLoader() {
  if (!loaderCache.has('docx')) {
    try {
      // @ts-ignore
      const dynamicImport: (s: string) => Promise<any> = new Function('s', 'return import(s)') as any;
      const pkg = await dynamicImport('@langchain/community');
      const DocxLoader = pkg?.document_loaders?.fs?.docx?.DocxLoader ?? pkg?.DocxLoader ?? pkg?.docx?.DocxLoader;
      if (!DocxLoader) throw new Error('DOCX loader not exported');
      loaderCache.set('docx', DocxLoader);
    } catch {
      throw new Error('DOCX loader not available. Install @langchain/community.');
    }
  }
  return loaderCache.get('docx');
}

async function getCsvLoader() {
  if (!loaderCache.has('csv')) {
    try {
      // @ts-ignore
      const dynamicImport: (s: string) => Promise<any> = new Function('s', 'return import(s)') as any;
      const pkg = await dynamicImport('@langchain/community');
      const CSVLoader = pkg?.document_loaders?.fs?.csv?.CSVLoader ?? pkg?.CSVLoader ?? pkg?.csv?.CSVLoader;
      if (!CSVLoader) throw new Error('CSV loader not exported');
      loaderCache.set('csv', CSVLoader);
    } catch {
      throw new Error('CSV loader not available. Install @langchain/community.');
    }
  }
  return loaderCache.get('csv');
}

export async function loadDocument(filePath: string): Promise<Document[]> {
  const ext = extname(filePath).toLowerCase();

  switch (ext) {
    case '.pdf': {
      const PDFLoaderClass = await getPdfLoader();
      if (!PDFLoaderClass) throw new Error('PDF loader unavailable');
      const loader = new (PDFLoaderClass as any)(filePath);
      return await loader.load();
    }

    case '.docx':
    case '.doc': {
      const DocxLoaderClass = await getDocxLoader();
      if (!DocxLoaderClass) throw new Error('DOCX loader unavailable');
      const loader = new (DocxLoaderClass as any)(filePath);
      return await loader.load();
    }

    case '.csv': {
      const CSVLoaderClass = await getCsvLoader();
      if (!CSVLoaderClass) throw new Error('CSV loader unavailable');
      const loader = new (CSVLoaderClass as any)(filePath);
      return await loader.load();
    }

    case '.txt': {
      const content = await readFile(filePath, 'utf-8');
      return [
        new Document({
          pageContent: content,
          metadata: { source: filePath },
        }),
      ];
    }

    default:
      throw new Error(
        `Unsupported file type: "${ext}". Supported types: .pdf, .docx, .csv, .txt`
      );
  }
}
