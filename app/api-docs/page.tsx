import { Metadata } from 'next'
import SwaggerUIComponent from '@/components/api-docs/swagger-ui'
import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'

export const metadata: Metadata = {
  title: 'API Documentation - IKO App',
  description: 'Interactive API documentation for the IKO industrial reporting and management application',
}

async function getOpenAPISpec() {
  try {
    const filePath = join(process.cwd(), 'docs', 'openapi.yaml')
    const fileContents = readFileSync(filePath, 'utf8')
    const spec = yaml.load(fileContents) as object
    return spec
  } catch (error) {
    console.error('Error loading OpenAPI spec:', error)
    return null
  }
}

export default async function APIDocsPage() {
  const spec = await getOpenAPISpec()

  if (!spec) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error Loading API Documentation</h1>
          <p className="text-red-600">
            Could not load the OpenAPI specification. Please ensure the docs/openapi.yaml file exists and is valid.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">API Documentation</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Welcome to IKO App API</h2>
            <p className="text-blue-700 mb-4">
              This interactive documentation allows you to explore and test all API endpoints. 
              Use the "Try it out" buttons to make live API calls directly from this interface.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3 border border-blue-200">
                <h3 className="font-semibold text-blue-800">Base URL</h3>
                <code className="text-blue-600">/api</code>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <h3 className="font-semibold text-blue-800">Format</h3>
                <code className="text-blue-600">JSON</code>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <h3 className="font-semibold text-blue-800">Authentication</h3>
                <code className="text-orange-600">None (Public)</code>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  All API endpoints are currently public and do not require authentication. 
                  This is a security concern that should be addressed in production.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <SwaggerUIComponent spec={spec} />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Generated from OpenAPI 3.0.3 specification • 
            <a 
              href="/docs/openapi.yaml" 
              className="text-blue-600 hover:text-blue-800 ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Raw Spec
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}