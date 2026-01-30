'use client'

import { useState, useEffect } from 'react'

interface APIStats {
  totalEndpoints: number
  categories: number
  methods: {
    GET: number
    POST: number
    PUT: number
    DELETE: number
    PATCH: number
  }
  features: {
    authentication: boolean
    validation: boolean
    rateLimit: boolean
    documentation: boolean
  }
}

const stats: APIStats = {
  totalEndpoints: 47,
  categories: 11,
  methods: {
    GET: 15,
    POST: 18,
    PUT: 8,
    DELETE: 5,
    PATCH: 1
  },
  features: {
    authentication: false,
    validation: false,
    rateLimit: false,
    documentation: true
  }
}

export default function APIStats() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="h-6 w-6 bg-blue-100 rounded flex items-center justify-center">
          <span className="text-blue-600 text-sm font-bold">🔧</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">API Overview</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Endpoints</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalEndpoints}</p>
            </div>
            <span className="text-2xl">📊</span>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Categories</p>
              <p className="text-2xl font-bold text-green-900">{stats.categories}</p>
            </div>
            <span className="text-2xl">📁</span>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">HTTP Methods</p>
              <p className="text-2xl font-bold text-purple-900">5</p>
            </div>
            <span className="text-2xl">⚙️</span>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Database Models</p>
              <p className="text-2xl font-bold text-orange-900">13</p>
            </div>
            <span className="text-2xl">🗄️</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">HTTP Methods Distribution</h4>
          <div className="space-y-2">
            {Object.entries(stats.methods).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      method === 'GET'
                        ? 'bg-blue-100 text-blue-800'
                        : method === 'POST'
                        ? 'bg-green-100 text-green-800'
                        : method === 'PUT'
                        ? 'bg-orange-100 text-orange-800'
                        : method === 'DELETE'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {method}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">API Features</h4>
          <div className="space-y-2">
            {Object.entries(stats.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${enabled ? 'text-green-500' : 'text-red-500'}`}>
                    {enabled ? '✅' : '❌'}
                  </span>
                  <span className="text-sm text-gray-700 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {enabled ? 'Enabled' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-400 text-lg">⚠️</span>
          <div>
            <h5 className="text-sm font-medium text-yellow-800">Security Notice</h5>
            <p className="text-sm text-yellow-700 mt-1">
              This API currently has no authentication or rate limiting. All endpoints are public.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}