import { useEffect, useState } from 'react'
import { CloudIcon, CloudIconSection } from '../types/cloud-icons.types'

export function useCloudIcons() {
  const [awsIcons, setAwsIcons] = useState<CloudIcon[]>([])
  const [azureIcons, setAzureIcons] = useState<CloudIcon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadIcons() {
      try {
        setIsLoading(true)

        // Load AWS icons
        const awsResponse = await fetch('/aws-icons.json')
        if (!awsResponse.ok) {
          throw new Error('Failed to load AWS icons')
        }

        const awsData: CloudIcon[] = await awsResponse.json()
        setAwsIcons(awsData)

        const azureResponse = await fetch('/azure-icons.json')
        if (!azureResponse.ok) {
          throw new Error('Failed to load Azure icons')
        }

        // Load Azure icons
        const azureData: CloudIcon[] = await azureResponse.json()
        setAzureIcons(azureData)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load cloud icons'
        )
        console.error('Error loading cloud icons:', err)
      } finally {
        setIsLoading(false)
      }
    }

    void loadIcons()
  }, [])

  function groupIconsByCloud(): CloudIconSection[] {
    const sections: CloudIconSection[] = []

    // Group AWS icons
    if (awsIcons.length > 0) {
      const awsCategories: { [category: string]: CloudIcon[] } = {}
      awsIcons.forEach((icon) => {
        if (!awsCategories[icon.category]) {
          awsCategories[icon.category] = []
        }
        awsCategories[icon.category].push(icon)
      })
      sections.push({
        title: 'AWS',
        cloud: 'AWS',
        categories: awsCategories,
      })
    }

    // Group Azure icons
    if (azureIcons.length > 0) {
      const azureCategories: { [category: string]: CloudIcon[] } = {}
      azureIcons.forEach((icon) => {
        if (!azureCategories[icon.category]) {
          azureCategories[icon.category] = []
        }
        azureCategories[icon.category].push(icon)
      })
      sections.push({
        title: 'Azure',
        cloud: 'Azure',
        categories: azureCategories,
      })
    }

    return sections
  }

  return {
    awsIcons,
    azureIcons,
    isLoading,
    error,
    groupIconsByCloud,
  }
}
