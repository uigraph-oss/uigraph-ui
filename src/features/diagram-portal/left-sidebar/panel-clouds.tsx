import { Input } from '@/components/ui/input'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useCloudIcons } from '../hooks/use-cloud-icons'
import { CloudsListView } from './clouds-list-view'
import { CloudsSearchView } from './clouds-search-view'
import { SidebarLayout } from './sidebar-layout'

export function SidebarClouds() {
  const { isLoading, error, groupIconsByCloud } = useCloudIcons()
  const [searchQuery, setSearchQuery] = useState('')
  const cloudSections = groupIconsByCloud()
  const isSearchMode = searchQuery.trim().length > 0

  if (isLoading) {
    return (
      <SidebarLayout className="left-18">
        <div className="flex flex-col gap-2 p-1">
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-gray-500">
                Loading cloud services...
              </span>
            </div>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout className="left-18">
        <div className="flex flex-col gap-2 p-1">
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-red-500">
              Error loading cloud icons: {error}
            </div>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout className="left-18">
      <div className="flex w-96 flex-col gap-3 p-3">
        <div className="sticky top-0 z-10 bg-white pb-1">
          <div className="relative">
            <FiSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 border-gray-200 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isSearchMode ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <CloudsSearchView
                cloudSections={cloudSections}
                searchQuery={searchQuery}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <CloudsListView cloudSections={cloudSections} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SidebarLayout>
  )
}
