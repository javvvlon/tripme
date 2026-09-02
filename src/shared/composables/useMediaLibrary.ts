import type { IMediaFile } from '~/shared/components/mediaLibrary/MediaLibrary.d'
import { useContentRepository } from '~/modules/content/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useMediaLibrary = () => {
  const { library, removeUpload, renameUpload } = useContentRepository()

  const mediaLibrary = async (query = ''): Promise<IMediaFile[]> =>
    (await library(query)).map(item => ({
      url: item.url,
      path: item.path,
      title: item.title ?? '',
      size: item.size ?? 0,
      uploadedAt: item.uploaded_at,
    }))

  return { mediaLibrary, removeMedia: removeUpload, renameMedia: renameUpload }
}
