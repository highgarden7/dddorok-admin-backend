import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { default as camelcaseKeys } from 'camelcase-keys';

@Injectable()
export class SnakeToCamelPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (value && typeof value === 'object') {
      const containsFile = this.containsFileObject(value);
      if (containsFile) return value;

      // 🔥 size_* 패턴 키만 별도 보존 후 camelcase-keys 실행
      const sizeKeyPattern = /^size_\d{2,3}_\d{2,3}$/;
      const preservedSizeKeys = this.extractSizeKeys(value, sizeKeyPattern);

      // 👇 나머지 키 camelCase 변환 (size_* 키 제외)
      const camelized = camelcaseKeys(value, {
        deep: true,
        exclude: [sizeKeyPattern], // 직접 제외
      });

      // 👇 보존한 size_* 키를 다시 덮어씌움
      Object.assign(camelized, preservedSizeKeys);

      return camelized;
    }
    return value;
  }

  private extractSizeKeys(obj: any, pattern: RegExp) {
    const result: Record<string, any> = {};
    Object.entries(obj).forEach(([key, val]) => {
      if (pattern.test(key)) {
        result[key] = val;
      } else if (typeof val === 'object' && val !== null) {
        // 깊이 있는 객체도 탐색 (필요 시)
        Object.assign(result, this.extractSizeKeys(val, pattern));
      }
    });
    return result;
  }

  private containsFileObject(obj: any, seen = new Set()): boolean {
    if (obj === null || typeof obj !== 'object') return false;
    if (seen.has(obj)) return false;
    seen.add(obj);

    if (Buffer.isBuffer(obj)) return true;

    if ('buffer' in obj && 'originalname' in obj && 'mimetype' in obj) {
      return true;
    }

    if (Array.isArray(obj)) {
      return obj.some((item) => this.containsFileObject(item, seen));
    }

    return Object.values(obj).some((val) => this.containsFileObject(val, seen));
  }
}
