const mongoose = require('mongoose')
const { User, Report, PowerInterruption, SiteVisual, DailyProduction, IncidentReport, EmployeePlanning } = require('../lib/models')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/ikoapp'

async function migrate() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected successfully!')

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      Report.deleteMany({}),
      PowerInterruption.deleteMany({}),
      SiteVisual.deleteMany({}),
      DailyProduction.deleteMany({}),
      IncidentReport.deleteMany({}),
      EmployeePlanning.deleteMany({})
    ])

    // Seed users
    console.log('Seeding users...')
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@ikoapp.com',
        role: 'admin'
      },
      {
        name: 'Reporter One',
        email: 'reporter1@ikoapp.com',
        role: 'reporter'
      },
      {
        name: 'Reporter Two',
        email: 'reporter2@ikoapp.com',
        role: 'reporter'
      },
      {
        name: 'Viewer User',
        email: 'viewer@ikoapp.com',
        role: 'viewer'
      }
    ])

    // Seed sample reports with complete data
    console.log('Seeding sample reports...')

    for (const user of users.filter(u => u.role === 'reporter')) {
      // Create a complete report for each reporter
      const report = new Report({
        date: new Date().toISOString().split('T')[0],
        reportedBy: user.name,
        reportedByEmail: user.email,
        status: 'submitted',
        submittedAt: new Date()
      })

      // Power Interruption
      const powerInterruption = new PowerInterruption({
        reportId: report._id,
        noInterruptions: false,
        occurredAt: '09:30',
        duration: 45,
        affectedMachines: ['Machine A', 'Machine C'],
        kplcMeter: 1250.5
      })
      await powerInterruption.save()
      report.powerInterruptionId = powerInterruption._id

      // Site Visuals
      const siteVisual = new SiteVisual({
        reportId: report._id,
        photos: ['photo1.jpg', 'photo2.jpg'],
        notes: 'Site looks clean and well-maintained'
      })
      await siteVisual.save()
      report.siteVisualId = siteVisual._id

      // Daily Production
      const dailyProduction = new DailyProduction({
        reportId: report._id,
        machineProductions: [
          {
            machineName: 'Machine A',
            producedUnits: 450,
            targetUnits: 500,
            efficiency: 90,
            downtime: 30,
            notes: 'Minor maintenance required'
          },
          {
            machineName: 'Machine B',
            producedUnits: 380,
            targetUnits: 400,
            efficiency: 95,
            downtime: 10,
            notes: 'Running smoothly'
          }
        ],
        totalProduced: 830,
        totalTarget: 900,
        overallEfficiency: 92.2
      })
      await dailyProduction.save()
      report.dailyProductionId = dailyProduction._id

      // Incident Report
      const incidentReport = new IncidentReport({
        reportId: report._id,
        noIncidents: false,
        incidents: [
          {
            type: 'safety',
            severity: 'low',
            description: 'Minor slip hazard identified',
            occurredAt: '14:30',
            affectedArea: 'Production Floor',
            immediateAction: 'Placed warning signs and cleaned area',
            reportedTo: 'Safety Officer',
            followUpRequired: true,
            followUpNotes: 'Monitor area for next 24 hours'
          }
        ]
      })
      await incidentReport.save()
      report.incidentReportId = incidentReport._id

      // Employee Planning
      const employeePlanning = new EmployeePlanning({
        reportId: report._id,
        totalEmployees: 25,
        presentEmployees: 23,
        shiftDetails: [
          {
            shift: 'morning',
            plannedEmployees: 12,
            actualEmployees: 11,
            supervisor: 'John Smith'
          },
          {
            shift: 'afternoon',
            plannedEmployees: 13,
            actualEmployees: 12,
            supervisor: 'Jane Doe'
          }
        ],
        overtimeHours: 8,
        trainingHours: 4,
        notes: 'One employee on medical leave'
      })
      await employeePlanning.save()
      report.employeePlanningId = employeePlanning._id

      await report.save()
      console.log(`Created complete report for ${user.name}`)
    }

    // Create a draft report
    const draftReport = new Report({
      date: new Date().toISOString().split('T')[0],
      reportedBy: users[1].name,
      reportedByEmail: users[1].email,
      status: 'draft'
    })

    const draftPowerInterruption = new PowerInterruption({
      reportId: draftReport._id,
      noInterruptions: true
    })
    await draftPowerInterruption.save()
    draftReport.powerInterruptionId = draftPowerInterruption._id

    await draftReport.save()
    console.log('Created draft report')

    console.log('Migration completed successfully!')

    // Display summary
    const userCount = await User.countDocuments()
    const reportCount = await Report.countDocuments()
    const submittedCount = await Report.countDocuments({ status: 'submitted' })
    const draftCount = await Report.countDocuments({ status: 'draft' })

    console.log('\nMigration Summary:')
    console.log(`Users created: ${userCount}`)
    console.log(`Total reports: ${reportCount}`)
    console.log(`Submitted reports: ${submittedCount}`)
    console.log(`Draft reports: ${draftCount}`)

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrate()
}

module.exports = migrate