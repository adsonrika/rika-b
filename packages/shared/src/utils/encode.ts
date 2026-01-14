export type BinaryContent = string | Uint8Array | Buffer

export type BinaryEncoding = BufferEncoding | 'base64'

export function encodeToBase64(content: BinaryContent, encoding: BufferEncoding | 'base64' = 'utf-8'): string {
  if (typeof content === 'string') {
    if (encoding === 'base64') {
      return content;
    }
    return Buffer.from(content, encoding).toString('base64');
  }
  return Buffer.from(content).toString('base64');
}