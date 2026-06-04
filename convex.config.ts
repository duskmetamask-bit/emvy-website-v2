import { defineApp } from 'convex/server'
import crons from './convex/crons'

const app = defineApp()
app.use(crons)

export default app
