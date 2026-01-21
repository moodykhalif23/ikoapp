// MongoDB initialization script for ikoapp
db = db.getSiblingDB('ikoapp');

// Create collections
db.createCollection('users');
db.createCollection('reports');
db.createCollection('power_interruptions');
db.createCollection('site_visuals');
db.createCollection('daily_productions');
db.createCollection('incident_reports');
db.createCollection('employee_plannings');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.reports.createIndex({ "reportedByEmail": 1 });
db.reports.createIndex({ "date": 1 });
db.reports.createIndex({ "submittedAt": 1 });

// Insert sample users
db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@ikoapp.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Reporter User",
    email: "reporter@ikoapp.com",
    role: "reporter",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Viewer User",
    email: "viewer@ikoapp.com",
    role: "viewer",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert sample machines data
db.createCollection('machines');
db.machines.insertMany([
  { name: "Machine A", type: "Production", status: "active" },
  { name: "Machine B", type: "Production", status: "active" },
  { name: "Machine C", type: "Assembly", status: "active" },
  { name: "Machine D", type: "Packaging", status: "active" },
  { name: "Machine E", type: "Quality Control", status: "active" }
]);

print('Database initialization completed successfully!');