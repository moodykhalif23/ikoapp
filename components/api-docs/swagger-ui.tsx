'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

interface SwaggerUIComponentProps {
  spec?: object
  url?: string
}

export default function SwaggerUIComponent({ spec, url }: SwaggerUIComponentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading API Documentation...</div>
      </div>
    )
  }

  return (
    <div className="swagger-ui-container">
      <SwaggerUI
        spec={spec}
        url={url}
        docExpansion="list"
        defaultModelsExpandDepth={2}
        defaultModelExpandDepth={2}
        displayOperationId={false}
        displayRequestDuration={true}
        filter={true}
        showExtensions={true}
        showCommonExtensions={true}
        tryItOutEnabled={true}
        requestInterceptor={(request) => {
          // Add any request interceptors here (e.g., auth headers)
          console.log('API Request:', request)
          return request
        }}
        responseInterceptor={(response) => {
          // Add any response interceptors here
          console.log('API Response:', response)
          return response
        }}
      />
      <style jsx global>{`
        .swagger-ui-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui .info {
          margin: 20px 0;
        }
        
        .swagger-ui .info .title {
          font-size: 2rem;
          color: #333;
        }
        
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          margin: 20px 0;
        }
        
        .swagger-ui .opblock.opblock-post {
          border-color: #49cc90;
          background: rgba(73, 204, 144, 0.1);
        }
        
        .swagger-ui .opblock.opblock-get {
          border-color: #61affe;
          background: rgba(97, 175, 254, 0.1);
        }
        
        .swagger-ui .opblock.opblock-put {
          border-color: #fca130;
          background: rgba(252, 161, 48, 0.1);
        }
        
        .swagger-ui .opblock.opblock-delete {
          border-color: #f93e3e;
          background: rgba(249, 62, 62, 0.1);
        }
        
        .swagger-ui .opblock.opblock-patch {
          border-color: #50e3c2;
          background: rgba(80, 227, 194, 0.1);
        }
        
        .swagger-ui .btn.try-out__btn {
          background: #4990e2;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .swagger-ui .btn.try-out__btn:hover {
          background: #357abd;
        }
        
        .swagger-ui .btn.execute {
          background: #4990e2;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .swagger-ui .btn.execute:hover {
          background: #357abd;
        }
        
        .swagger-ui .response-col_status {
          font-weight: bold;
        }
        
        .swagger-ui .response-col_status.response-undocumented {
          color: #999;
        }
        
        .swagger-ui .response-col_status.response-200 {
          color: #49cc90;
        }
        
        .swagger-ui .response-col_status.response-400,
        .swagger-ui .response-col_status.response-401,
        .swagger-ui .response-col_status.response-404 {
          color: #f93e3e;
        }
        
        .swagger-ui .model-box {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 10px;
        }
        
        .swagger-ui .model-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
        }
        
        .swagger-ui .parameter__name {
          font-weight: bold;
          color: #333;
        }
        
        .swagger-ui .parameter__type {
          color: #666;
          font-size: 0.9rem;
        }
        
        .swagger-ui .opblock-summary-description {
          color: #666;
        }
        
        .swagger-ui .opblock-description-wrapper p {
          color: #333;
          margin: 10px 0;
        }
        
        .swagger-ui .tab li {
          font-size: 0.9rem;
        }
        
        .swagger-ui .highlight-code {
          background: #f8f9fa;
        }
        
        .swagger-ui .microlight {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  )
}