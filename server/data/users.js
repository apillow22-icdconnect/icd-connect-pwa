const bcrypt = require('bcryptjs');

// In-memory data store (in production, use a real database)
let users = [
  {
    id: 'super_admin',
    email: 'superadmin@icd.com',
    password: bcrypt.hashSync('superadmin123', 10),
    name: 'Super Administrator',
    role: 'super_admin',
    teamId: 'system',
    position: 'System Administrator'
  },
  {
    id: '1',
    email: 'admin@icd.com',
    password: bcrypt.hashSync('admin123', 10),
    name: 'John Smith',
    role: 'admin',
    teamId: 'team1',
    position: 'ICD Owner'
  },
  {
    id: '2',
    email: 'leader@icd.com',
    password: bcrypt.hashSync('leader123', 10),
    name: 'Sarah Johnson',
    role: 'team_leader',
    teamId: 'team1',
    position: 'Team Leader'
  },
  {
    id: '3',
    email: 'rep1@icd.com',
    password: bcrypt.hashSync('rep123', 10),
    name: 'Mike Davis',
    role: 'rep',
    teamId: 'team1',
    position: 'Sales Representative'
  },
  {
    id: '4',
    email: 'rep2@icd.com',
    password: bcrypt.hashSync('rep123', 10),
    name: 'Lisa Wilson',
    role: 'rep',
    teamId: 'team1',
    position: 'Sales Representative'
  },
  {
    id: '5',
    email: 'campaign@icd.com',
    password: bcrypt.hashSync('campaign123', 10),
    name: 'Alex Rodriguez',
    role: 'campaign_manager',
    teamId: 'team1',
    position: 'Campaign Manager'
  }
];

let messages = [];
let schedules = [];
let trainingModules = [];
let tests = [];
let testResults = [];
let testTemplates = [];

module.exports = {
  users,
  messages,
  schedules,
  trainingModules,
  tests,
  testResults,
  testTemplates
};
