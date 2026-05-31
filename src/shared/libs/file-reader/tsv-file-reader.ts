import { createReadStream } from 'node:fs';
import { FileReader } from './file-reader.interface.js';
import { ParsedLine } from '../../types/index.js';
import { createOffer } from '../../helpers/index.js';
import { EventEmitter } from 'node:events';

const CHUNK_SIZE = 16384;
export class TsvFileReader extends EventEmitter implements FileReader {
  private rawData = '';

  constructor(private filePath: string) {
    super();
  }

  public async read(): Promise<void> {
    const readStream = createReadStream(this.filePath, {
      highWaterMark: CHUNK_SIZE,
      encoding: 'utf-8',
    });

    let remainingData = '';
    let nextLinePosition = -1;
    let importedRowCount = 0;

    for await (const chunk of readStream) {
      remainingData += chunk.toString();

      while ((nextLinePosition = remainingData.indexOf('\n')) >= 0) {
        const line = remainingData.slice(0, nextLinePosition + 1).trim();
        remainingData = remainingData.slice(++nextLinePosition);
        importedRowCount++;
        await new Promise((resolve) => {
          this.emit('line', line, resolve);
        });
      }
    }

    if (remainingData.trim().length > 0) {
      importedRowCount++;
      await new Promise((resolve) => {
        this.emit('line', remainingData.trim(), resolve);
      });
    }

    this.emit('end', importedRowCount);
  }

  public toArray(): ParsedLine[] {
    if (!this.rawData) {
      throw new Error('No data to parse. Please call read() method first.');
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => createOffer(line));
  }
}
