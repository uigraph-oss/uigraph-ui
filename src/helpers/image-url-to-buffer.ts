'use server'

export async function convertImageUrlToServerBuffer(
  imageUrl: string,
  fileName: string
): Promise<{ buffer: ArrayBuffer; type: string; name: string }> {
  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    return {
      buffer: arrayBuffer,
      type: response.headers.get('content-type') || 'image/jpeg',
      name: fileName,
    }
  } catch (error) {
    console.error('Error converting image URL to file:', error)
    throw new Error('Failed to convert image URL to file')
  }
}
