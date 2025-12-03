import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'form-errors.log');

export const logFormError = (context, payload) => {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    const entry = `[${new Date().toISOString()}] ${context}\n${JSON.stringify(payload, null, 2)}\n\n`;
    fs.appendFileSync(LOG_FILE, entry, 'utf8');
  } catch (err) {
    console.error('Failed to write log entry:', err);
  }
};
