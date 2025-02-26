export const generateSlug = (title: string): string =>{
  return title
    .toLowerCase() // 小文字に変換
    .normalize('NFKD') // Unicode正規化
    .replace(/[\u0300-\u036f]/g, '') // アクセント記号を削除
    .replace(/[^\w\s-]/g, '') // 特殊文字を削除
    .replace(/\s+/g, '-') // スペースをハイフンに変換
    .replace(/-+/g, '-') // 連続するハイフンを単一のハイフンに
    .trim() // 前後の空白を削除
    .replace(/^-+|-+$/g, ''); // 先頭と末尾のハイフンを削除
}

export const generateRandomSlug = (): string =>{
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}