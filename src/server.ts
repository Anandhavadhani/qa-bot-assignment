import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { getModel, getModelName } from './model';
import { loadDocument } from './loaders';
import { buildChain, runChain } from './chain';
import { InvokeSchema, FileUploadSchema, PromptType } from './types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const UPLOADS_DIR = join(process.cwd(), 'uploads');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = randomBytes(4).toString('hex');
    const ext = file.originalname.split('.').pop();
    cb(null, `${timestamp}-${random}.${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

function generateRequestId(): string {
  return randomBytes(8).toString('hex');
}

function getLoggingInfo(requestId: string, question: string, startTime: number): string {
  const duration = Date.now() - startTime;
  return `[${new Date().toISOString()}] [${requestId}] Q: ${question} (${duration}ms)`;
}

app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(process.cwd(), 'index.html'));
});

app.get('/health', (req: Request, res: Response) => {
  const requestId = generateRequestId();
  const model = getModelName();
  const timestamp = new Date().toISOString();

  res.json({
    status: 'ok',
    model,
    timestamp,
  });
});

app.post('/search/document', async (req: Request, res: Response) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const parsed = InvokeSchema.parse(req.body);
    const promptType: PromptType = parsed.promptType ?? 'default';

    const model = getModel();
    const chain = buildChain(model, promptType);
    const answer = await runChain(chain, parsed.documentText, parsed.question);
    const responseTime = Date.now() - startTime;
    const modelName = getModelName();

    console.log(getLoggingInfo(requestId, parsed.question, startTime));

    res.json({
      answer,
      model: modelName,
      responseTime,
      promptType,
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error(`[${requestId}] Validation error:`, err.message);
      return res.status(400).json({
        error: 'Invalid request body',
        requestId,
      });
    }

    if (err instanceof Error && err.message.includes('Validation failed')) {
      console.error(`[${requestId}] Validation error:`, err.message);
      return res.status(400).json({
        error: err.message,
        requestId,
      });
    }

    console.error(`[${requestId}] Server error:`, err);
    res.status(500).json({
      error: 'Internal server error',
      requestId,
    });
  }
});

app.post('/search/upload', upload.array('files'), async (req: Request, res: Response) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No file provided',
        requestId,
      });
    }

    const question = req.body.question as string;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Question is required',
        requestId,
      });
    }

    const promptTypeRaw = req.body.promptType as string | undefined;
    const promptType: PromptType = (promptTypeRaw as PromptType) ?? 'default';

    const file = files[0];
    const documentContent = await loadDocument(file.path);
    const documentText = documentContent.map((doc) => doc.pageContent).join('\n\n');

    const model = getModel();
    const chain = buildChain(model, promptType);
    const answer = await runChain(chain, documentText, question);
    const responseTime = Date.now() - startTime;
    const modelName = getModelName();

    console.log(getLoggingInfo(requestId, question, startTime));

    res.json({
      answer,
      model: modelName,
      responseTime,
      promptType,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('Unsupported file type')) {
        console.error(`[${requestId}] Unsupported file type:`, err.message);
        return res.status(415).json({
          error: err.message,
          requestId,
        });
      }

      if (err.message.includes('File too large') || err.message.includes('size')) {
        console.error(`[${requestId}] File too large:`, err.message);
        return res.status(413).json({
          error: 'File too large',
          requestId,
        });
      }
    }

    console.error(`[${requestId}] Server error:`, err);
    res.status(500).json({
      error: 'Internal server error',
      requestId,
    });
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = generateRequestId();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE' || err.message.includes('size')) {
      console.error(`[${requestId}] File size exceeded:`, err.message);
      return res.status(413).json({
        error: 'File too large',
        requestId,
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      console.error(`[${requestId}] Unexpected file field:`, err.message);
      return res.status(400).json({
        error: 'Invalid form data',
        requestId,
      });
    }
  }

  if (err.message === 'Unsupported file type') {
    console.error(`[${requestId}] Unsupported file:`, err.message);
    return res.status(415).json({
      error: err.message,
      requestId,
    });
  }

  console.error(`[${requestId}] Unhandled error:`, err);
  res.status(500).json({
    error: 'Internal server error',
    requestId,
  });
});

async function startServer() {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    console.log(`Uploads directory created at: ${UPLOADS_DIR}`);

    app.listen(PORT, () => {
      console.log(`QA Bot server running on http://localhost:${PORT}`);
      console.log(`Model provider: ${process.env.MODEL_PROVIDER ?? 'openai'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
