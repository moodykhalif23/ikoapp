const mongoose = require('mongoose')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment.')
  process.exit(1)
}

const collectionsToClear = [
  'users',
  'reports',
  'powerinterruptions',
  'power_interruptions',
  'sitevisuals',
  'site_visuals',
  'dailyproductions',
  'daily_productions',
  'incidentreports',
  'incident_reports',
  'employeeplannings',
  'employee_plannings',
  'machines',
  'employees',
  'equipmentmaintenances',
  'equipment_maintenances',
  'notifications',
  'incidenttasks',
  'pushsubscriptions',
  'attendances'
]

async function resetDb() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected successfully!')

    const existingCollections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray()
    const existingNames = new Set(existingCollections.map((c) => c.name))

    const targets = collectionsToClear.filter((name) => existingNames.has(name))
    if (targets.length === 0) {
      console.log('No matching collections found to clear.')
      return
    }

    console.log(`Clearing ${targets.length} collections...`)
    for (const name of targets) {
      await mongoose.connection.db.collection(name).deleteMany({})
      console.log(`- Cleared ${name}`)
    }

    console.log('Database reset completed.')
  } catch (error) {
    console.error('Database reset failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

if (require.main === module) {
  resetDb()
}

module.exports = resetDb
