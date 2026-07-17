export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFile(name: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

export function isPdfFile(name: string): boolean {
  return /\.pdf$/i.test(name);
}
