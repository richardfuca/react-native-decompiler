import crypto from 'crypto';

export default class CacheParse {
  originalFile: string;
  cacheFile: string;

  constructor(originalFile: string, cacheFile: string) {
    this.originalFile = originalFile;
    this.cacheFile = cacheFile;
  }

  validateCache() {
    return this.cacheFile.split('\n')[0] !== crypto.createHash('md5').update(this.originalFile).digest('hex');
  }

  parseCache() {

  }
}
