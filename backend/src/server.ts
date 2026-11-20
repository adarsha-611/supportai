import 'dotenv/config'
import app from './app.js'
import { connectMongo } from './config/mongo.js'

await connectMongo()

const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})