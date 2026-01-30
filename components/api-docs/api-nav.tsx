'use client'

import Link from 'next/link'
import { useState } from 'react'

const apiSections = [
  {
    name: 'Authentication',
    endpoints: [
      { method: 'POST', path: '/auth/login', description: 'User login' },
      { method: 'POST', path: '/auth/signup', description: 'User registration' },
    ]
  },
  {
    name: 'Users',
    endpoints: [
      { method: 'GET', path: '/users', description: 'Get all users' },
      { method: 'PUT', path: '/users/update-role', description: 'Update user roles' },
    ]
  },
  {
    name: 'Employees',
    endpoints: [
      { method: 'GET', path: '/employees', description: 'Get all employees' },
      { method: 'POST', path: '/employees', description: 'Create employee' },
      { method: 'PUT', path: '/employees/{id}', description: 'Update employee' },
      { method: 'DELETE', path: '/employees/{id}', description: 'Delete employee' },
      { method: 'POST', path: '/employees/import', description: 'Bulk import employees' },
    ]
  },
  {
    name: 'Attendance',
    endpoints: [
      { method: 'GET', path: '/attendance', description: 'Get attendance records' },
      { method: 'POST', path: '/attendance', description: 'Create attendance record' },
      { method: 'PUT', path: '/attendance/{id}', description: 'Update attendance record' },
      { method: 'POST', path: '/attendance/submit', description: 'Submit attendance notification' },
    ]
  },
  {
    name: 'Reports',
    endpoints: [
      { method: 'GET', path: '/reports', description: 'Get reports with filtering' },
      { method: 'POST', path: '/reports', description: 'Create new report' },
      { method: 'GET', path: '/reports/{id}', description: 'Get specific report' },
      { method: 'PUT', path: '/reports/{id}', description: 'Update report' },
      { method: 'DELETE', path: '/reports/{id}', description: 'Delete report' },
    ]
  },
  {
    name: 'Machines',
    endpoints: [
      { method: 'GET', path: '/machines', description: 'Get machines' },
      { method: 'POST', path: '/machines', description: 'Create machine' },
      { method: 'PUT', path: '/machines/{id}', description: 'Update machine' },
      { method: 'DELETE', path: '/machines/{id}', description: 'Delete machine' },
    ]
  },
  {
    name: 'Maintenance',
    endpoints: [
      { method: 'GET', path: '/equipment-maintenance', description: 'Get maintenance records' },
      { method: 'POST', path: '/equipment-maintenance', description: 'Create maintenance record' },
      { method: 'PUT', path: '/equipment-maintenance/{id}', description: 'Update maintenance record' },
      { method: 'DELETE', path: '/equipment-maintenance/{id}', description: 'Delete maintenance record' },
    ]
  },
  {
    name: 'Tasks',
    endpoints: [
      { method: 'GET', path: '/tasks', description: 'Get incident tasks' },
      { method: 'POST', path: '/tasks', description: 'Create task' },
      { method: 'GET', path: '/tasks/{id}', description: 'Get specific task' },
      { method: 'PUT', path: '/tasks/{id}', description: 'Update task' },
    ]
  },
  {
    name: 'Notifications',
    endpoints: [
      { method: 'GET', path: '/notifications', description: 'Get notifications' },
      { method: 'POST', path: '/notifications', description: 'Create notification' },
      { method: 'PATCH', path: '/notifications', description: 'Mark notifications as read' },
      { method: 'DELETE', path: '/notifications', description: 'Delete notification' },
      { method: 'GET', path: '/notifications/stream', description: 'SSE notification stream' },
    ]
  },
  {
    name: 'Uploads',
    endpoints: [
      { method: 'POST', path: '/uploads', description: 'Upload files' },
      { method: 'GET', path: '/uploads/test', description: 'Test upload directory' },
    ]
  },
  {
    name: 'Push Notifications',
    endpoints: [
      { method: 'POST', path: '/push/subscribe', description: 'Subscribe to push notifications' },
      { method: 'POST', path: '/push/unsubscribe', description: 'Unsubscribe from push notifications' },
    ]
  },
]

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'POST':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'PUT':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'DELETE':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'PATCH':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function APINav() {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">🔧</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">API Explorer</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">47 endpoints across 11 categories</p>
      </div>

      <div className="p-4">
        <div className="space-y-2 mb-6">
          <Link
            href="/api-docs"
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-blue-600">📖</span>
            <span>Interactive Documentation</span>
          </Link>
          
          <a
            href="/docs/openapi.yaml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-gray-600">⚡</span>
            <span>OpenAPI Spec</span>
          </a>
        </div>

        <div className="space-y-1">
          {apiSections.map((section) => (
            <div key={section.name} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(section.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                <span>{section.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {section.endpoints.length}
                  </span>
                  <span
                    className={`text-gray-400 transition-transform ${
                      expandedSections.includes(section.name) ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </button>
              
              {expandedSections.includes(section.name) && (
                <div className="border-t border-gray-200 bg-white">
                  {section.endpoints.map((endpoint, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getMethodColor(
                            endpoint.method
                          )}`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-xs text-gray-600 font-mono">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-xs text-gray-500">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}