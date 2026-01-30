import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation - IKO App',
  description: 'Interactive API documentation for the IKO industrial reporting and management application',
}

export default function APIDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}