import type { IModule } from '../shared/bootstrap/contracts'
import { LandingModule } from '../landing'
import { SearchEngineModule } from '../search_engine'
import { AuthModule } from './auth'
import { ContentModule } from './content'
import { PostsModule } from './posts'
import { LeadsModule } from './leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const modules: IModule[] = [
  SearchEngineModule,
  LandingModule,
  AuthModule,
  ContentModule,
  PostsModule,
  LeadsModule,
]
