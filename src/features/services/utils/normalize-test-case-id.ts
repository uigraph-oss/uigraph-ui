/**
 * Canonical key for matching test case IDs (e.g. result.testCaseId to testCase.testCaseId).
 *
 * Normalization rules (applied to both sides before comparing):
 * - Trim whitespace
 * - Lowercase
 * - Use last segment split by "_" (so "test_case_xyz" and "xyz" match)
 * - Strip all non-alphanumeric characters from that segment (so "XYZ-1", "xyz_1", "xyz 1" match)
 */
export function normalizeTestCaseIdForMatch(
  id: string | null | undefined
): string {
  const raw = (id ?? '').trim().toLowerCase()
  if (raw === '') return ''
  const last = raw.split('_').pop() ?? raw
  return last.replace(/[^a-z0-9]/g, '')
}
