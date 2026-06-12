'use client'

import axios, { AxiosError } from 'axios'

export interface FigmaNodeInfo {
  nodeId: string
  imageUrl: string
  name: string
}

export function isValidFigmaUrl(url: string): boolean {
  return /^https:\/\/www\.figma\.com\/[^\/]+\/[a-zA-Z0-9]+/.test(url)
}

function extractFileKeyFromUrl(url: string): string | null {
  const match = url.match(/figma\.com\/[^\/]+\/([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

export async function getFigmaNodeInfo(
  accessToken: string,
  figmaUrl: string
): Promise<FigmaNodeInfo> {
  const fileKey = extractFileKeyFromUrl(figmaUrl)
  if (!fileKey) throw new Error('Figma URL should have a file key')

  const urlParams = new URLSearchParams(figmaUrl.split('?')[1] || '')
  const rawNodeId = urlParams.get('node-id')

  if (!rawNodeId) throw new Error('Figma URL should have a node id')
  const formattedNodeId = rawNodeId.replace(/-/g, ':')

  const { data: nodeData } = await axios.get(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${formattedNodeId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const { data: imageData } = await axios.get(
    `https://api.figma.com/v1/images/${fileKey}?ids=${formattedNodeId}&format=jpg&scale=2`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const imageUrl = imageData.images[formattedNodeId]
  if (!imageUrl) {
    throw new AxiosError('Figma component not found')
  }

  return {
    imageUrl,
    nodeId: formattedNodeId,
    name: nodeData.nodes[formattedNodeId]?.document?.name ?? 'Untitled',
  }
}
