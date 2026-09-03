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

/** What the gallery hands back when it closes. */
export interface IGalleryResult {
  /** The file that was picked, if one was. */
  url?: string
  /** The file the caller was pointing at, if it was deleted from storage. */
  removed?: string
}

export interface IMediaLibraryProps {
  current?: string | null
  library?: (query?: string, folder?: string) => Promise<IMediaFile[]>
  uploader?: (file: File) => Promise<string>
  accept?: string[]
}
