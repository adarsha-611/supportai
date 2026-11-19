import 'dotenv/config'
import app from './app.js'
import { prisma } from './config/prisma.js'
import { connectMongo } from './config/mongo.js'



const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})