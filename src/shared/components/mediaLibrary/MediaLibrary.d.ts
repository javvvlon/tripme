/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMediaFile {
  url: string
  path: string
  title: string
  size: number
  uploadedAt: string | null
}

export interface IMediaLibraryProps {
  library?: (query?: string) => Promise<IMediaFile[]>
  uploader?: (file: File) => Promise<string>
  accept?: string[]
}
