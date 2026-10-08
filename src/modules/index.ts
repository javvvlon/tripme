import type { IModule } from '../shared/bootstrap/contracts'
import { LandingModule } from '../landing'
import { SearchEngineModule } from '../search_engine'
import { AuthModule } from './auth'
import { AccountModule } from './account'
import { ContentModule } from './content'
import { PostsModule } from './posts'
import { LeadsModule } from './leads'
import { OperatorsModule } from './operators'
import { PointsModule } from './points'
import { AnalyticsModule } from './analytics'
import { FinanceModule } from './finance'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const modules: IModule[] = [
  SearchEngineModule,
  LandingModule,
  AuthModule,
  AccountModule,
  ContentModule,
  PostsModule,
  LeadsModule,
  OperatorsModule,
  PointsModule,
  AnalyticsModule,
  FinanceModule,
]
