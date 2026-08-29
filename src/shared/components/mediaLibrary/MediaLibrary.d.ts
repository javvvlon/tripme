/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMediaFile {
  url: string
  path: string
}

export interface IMediaLibraryProps {
  library: () => Promise<IMediaFile[]>
  uploader?: (file: File) => Promise<string>
  accept?: string[]
}
