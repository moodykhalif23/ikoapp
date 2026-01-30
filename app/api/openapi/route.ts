import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'docs', 'openapi.yaml')
    const fileContents = readFileSync(filePath, 'utf8')
    const spec = yaml.load(fileContents)
    
    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error loading OpenAPI spec:', error)
    return NextResponse.json(
      { error: 'Failed to load OpenAPI specification' },
      { status: 500 }
    )
  }
}