import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './modules/auth/auth.routes.js'
import businessRoutes from './modules/businesses/business.routes.js'


import { errorHandler } from './middleware/errorHandler.js'
import cookieParser from 'cookie-parser'
import invitationRoutes from './modules/invitations/invitation.routes.js'
import ticketRoutes from './modules/tickets/ticket.routes.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use('/api/v1/businesses', businessRoutes)
app.use('/api/v1/invitations', invitationRoutes)
app.use('/api/v1/tickets', ticketRoutes)

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/auth', authRoutes)

app.use(errorHandler)

export default app