import * as iconv from 'iconv-lite';

/**
 * 한글이 깨진 파일명을 UTF-8로 복원합니다.
 * 보통 multipart/form-data 업로드 시 originalname이 'latin1'로 들어오기 때문에
 * 이를 'utf-8'로 다시 디코딩하여 한글을 정상 복구합니다.
 *
 * @param filename 깨진 파일명 (latin1 인코딩된 문자열)
 * @returns 복원된 한글 파일명
 */
export function decodeFilename(filename: string): string {
  try {
    return iconv.decode(Buffer.from(filename, 'latin1'), 'utf-8');
  } catch (error) {
    // 디코딩 실패 시 원본 반환
    return filename;
  }
}
