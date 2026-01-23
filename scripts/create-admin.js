const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment.')
  process.exit(1)
}

const args = process.argv.slice(2)
const getArg = (name) => {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  return args[index + 1]
}

const name = getArg('--name') || 'Admin User'
const email = getArg('--email')
const password = getArg('--password')

if (!email) {
  console.error('Missing required --email argument.')
  process.exit(1)
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  roles: [{ type: String, enum: ['admin', 'reporter', 'viewer'] }],
  employeeType: { type: String, enum: ['permanent', 'casual'], default: 'permanent' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected successfully!')

    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      const update = { $addToSet: { roles: 'admin' } }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12)
        update.$set = { password: hashedPassword }
      }
      if (name) {
        update.$set = { ...(update.$set || {}), name }
      }

      const updatedUser = await User.findOneAndUpdate(
        { email: normalizedEmail },
        update,
        { new: true }
      )

      console.log(`Updated user: ${updatedUser.email}`)
      console.log(`Roles: ${updatedUser.roles.join(', ')}`)
      return
    }

    if (!password) {
      console.error('Missing required --password for new admin user.')
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      roles: ['admin'],
      employeeType: 'permanent',
      status: 'active'
    })

    await user.save()
    console.log(`Created admin user: ${user.email}`)
  } catch (error) {
    console.error('Admin creation failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

if (require.main === module) {
  createAdmin()
}

module.exports = createAdmin
