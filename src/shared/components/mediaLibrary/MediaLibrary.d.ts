/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMediaFile {
  url: string
  path: string
  title: string
  folderId: string | null
  size: number
  uploadedAt: string | null
}

export interface IMediaFolder {
  id: string
  name: string
  count: number
}

export interface IGalleryResult {
  url?: string
  removed?: string
}

export interface IMediaLibraryProps {
  current?: string | null
  library?: (query?: string, folder?: string) => Promise<IMediaFile[]>
  uploader?: (file: File) => Promise<string>
  accept?: string[]
}
