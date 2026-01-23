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

// Create indexes (skip email index since it's already defined in the schema as unique)
db.users.createIndex({ "roles": 1 });
db.reports.createIndex({ "reportedByEmail": 1 });
db.reports.createIndex({ "date": 1 });
db.reports.createIndex({ "submittedAt": 1 });

// Create machines collection (no seed data)
db.createCollection('machines');

print('Database initialization completed successfully!');
