import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercelのサーバーレス関数のエクスポート形式
export default function (request: VercelRequest, response: VercelResponse) {
  // HTTPステータスコード200 (OK) でレスポンスを送信
  response.status(200).send('Hello from Backend!');
}