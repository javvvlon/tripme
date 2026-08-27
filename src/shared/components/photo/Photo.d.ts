import type { IPhoto } from '~/shared/contracts/media'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPhotoProps {
  photo: IPhoto
  ratio?: string
  eager?: boolean
  sizes?: string
}
