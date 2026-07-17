const GEMMA_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent';

export interface ClassifyResult {
  topic: string;
  type: 'pdf' | 'img';
  suggestedFilename: string;
}

export interface ExtractResult {
  deadlines?: Array<{ title: string; dueDate: string }>;
  events?: Array<{ title: string; date: string }>;
  keyFacts?: string[];
}

export async function classifyDocument(
  fileUri: string,
  apiKey: string,
): Promise<ClassifyResult> {
  // TODO: implement Gemma 4 API call
  throw new Error('Gemma integration not yet implemented');
}

export async function extractFromDocument(
  fileUri: string,
  apiKey: string,
): Promise<ExtractResult> {
  // TODO: implement Gemma 4 API call with function calling
  throw new Error('Gemma integration not yet implemented');
}

export async function answerQuestion(
  roomId: string,
  question: string,
  apiKey: string,
): Promise<string> {
  // TODO: implement
  throw new Error('Gemma integration not yet implemented');
}
