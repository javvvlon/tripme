import type { IMediaFile, IMediaFolder } from '~/shared/components/mediaLibrary/MediaLibrary.d'
import { useContentRepository } from '~/modules/content/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useMediaLibrary = () => {
  const repository = useContentRepository()

  const mediaLibrary = async (query = '', folder = ''): Promise<IMediaFile[]> =>
    (await repository.library(query, folder)).map(item => ({
      url: item.url,
      path: item.path,
      title: item.title ?? '',
      folderId: item.folder_id ?? null,
      size: item.size ?? 0,
      uploadedAt: item.uploaded_at,
    }))

  const mediaFolders = async (): Promise<IMediaFolder[]> =>
    (await repository.folders()).map(item => ({
      id: item.id,
      name: item.name,
      count: item.count ?? 0,
    }))

  return {
    mediaLibrary,
    mediaFolders,
    createFolder: repository.createFolder,
    renameFolder: repository.renameFolder,
    deleteFolder: repository.deleteFolder,
    removeMedia: repository.removeUpload,
    describeMedia: repository.describeUpload,
  }
}
