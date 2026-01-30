import { Metadata } from 'next'
import APINav from '@/components/api-docs/api-nav'
import APIStats from '@/components/api-docs/api-stats'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'API Explorer - IKO App',
  description: 'Explore and understand the IKO App API structure and endpoints',
}

export default function APIExplorerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <APINav />
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">API Explorer</h1>
              <p className="text-lg text-gray-600 mb-6">
                Discover and understand the complete API structure of the IKO industrial reporting application.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Link
                  href="/api-docs"
                  className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">📖</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Interactive Documentation</h3>
                        <p className="text-sm text-gray-600">Test API endpoints with Swagger UI</p>
                      </div>
                    </div>
                    <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
                  </div>
                </Link>
                
                <a
                  href="/docs/openapi.yaml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-semibold">⚡</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">OpenAPI Specification</h3>
                        <p className="text-sm text-gray-600">Download the raw YAML spec</p>
                      </div>
                    </div>
                    <span className="text-gray-400 group-hover:text-green-600 transition-colors">→</span>
                  </div>
                </a>
              </div>
            </div>

            {/* API Statistics */}
            <APIStats />

            {/* Quick Start Guide */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Guide</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1. Base URL</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <code className="text-sm text-gray-800">
                      https://your-domain.com/api
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2. Authentication</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Important:</strong> All endpoints are currently public and do not require authentication.
                      This should be addressed before production deployment.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3. Example Request</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 overflow-x-auto">
{`curl -X GET "https://your-domain.com/api/employees" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4. Response Format</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "success": true,
  "data": [
    {
      "_id": "employee_id",
      "name": "John Doe",
      "employeeId": "EMP001",
      "status": "active"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Use Cases */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Common Use Cases</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Create and manage employee records</li>
                    <li>• Bulk import employees from CSV</li>
                    <li>• Track employee attendance</li>
                    <li>• Update employee information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Daily Reporting</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Submit daily production reports</li>
                    <li>• Record incident reports</li>
                    <li>• Track power interruptions</li>
                    <li>• Upload site visuals</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Maintenance</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Schedule maintenance tasks</li>
                    <li>• Track maintenance history</li>
                    <li>• Manage equipment inventory</li>
                    <li>• Monitor maintenance status</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time notifications via SSE</li>
                    <li>• Web push notifications</li>
                    <li>• Role-based notification routing</li>
                    <li>• Task assignment notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}