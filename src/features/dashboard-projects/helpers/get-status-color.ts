export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-[#10715433] text-[#107154]'
    case 'completed':
      return 'bg-blue-100 text-blue-700'
    case 'inactive':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
