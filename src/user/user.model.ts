import * as mongoose from 'mongoose'

export interface User extends mongoose.Document {
  name: string
  password: string
  role: number
}

export const UserSchema = new mongoose.Schema({
  name: String,
  password: String,
  role: Number
})

export class UserDoc {
  _id: string
  name: string
  password: string
  role: number
}
