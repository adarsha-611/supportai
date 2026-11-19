import 'dotenv/config'
import mongoose from 'mongoose'

export async function connectMongo(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in .env')
  }

  await mongoose.connect(mongoUri)
  console.log('MongoDB connected')
}