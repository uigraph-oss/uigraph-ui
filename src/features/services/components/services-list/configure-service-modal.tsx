import { GitIcon, JiraIcon, SlackIcon } from '@/assets/svgs'
import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/features/component-meta'
import { ComponentMetaThemeProvider } from '@/features/component-meta/theme'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { arrayNonNullable } from 'daily-code'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const configureServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),

  gitRepoUrl: z.url('Invalid URL').optional(),
  gitRepoName: z.string().optional(),

  jiraProjectUrl: z.url('Invalid URL').optional(),
  jiraProjectName: z.string().optional(),

  slackChannelUrl: z.url('Invalid URL').optional(),
  slackChannelName: z.string().optional(),

  labels: z.array(z.string()).optional(),
  teamId: z.string().min(1, 'Team is required'),
})

type ConfigureServiceModalProps = {
  mode: 'create' | 'update'
  defaultValues?: Partial<z.infer<typeof configureServiceSchema>>
  onSubmit: (data: z.infer<typeof configureServiceSchema>) => Promise<void>
}

const SERVICE_CATEGORIES = [
  'Backend', // REST / gRPC / GraphQL services
  'Frontend', // Web apps, SPAs, SSR
  'Mobile', // iOS, Android, React Native
  'Database', // Postgres, MySQL, MongoDB, etc.
  'Worker', // Background jobs, cron, event processors
  'Messaging', // Kafka, RabbitMQ, SQS, SNS
  'Cache', // Redis, Memcached, CDN
  'Gateway', // API gateways, reverse proxies, load balancers
  'Infrastructure', // Cloud resources, IaC, CI/CD pipelines
  'Library', // Shared packages, SDKs, internal libs
  'Other',
]

export function ConfigureServiceModal({
  mode,
  defaultValues,
  onSubmit,
}: ConfigureServiceModalProps) {
  const orgId = useCurrentOrganization().id
  const teamRes = useQuery(TEAMS, {
    variables: { orgId: orgId! },
    skip: !orgId,
  })
  const teams = arrayNonNullable(teamRes.data?.teams ?? [])

  const form = useForm({
    resolver: zodResolver(configureServiceSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      labels: [],
      ...defaultValues,
    },
  })

  return (
    <BetterDialogContent
      title={`${mode === 'create' ? 'Create' : 'Update'} Service`}
      description={`${mode === 'create' ? 'Create' : 'Update'} service configuration`}
      footerSubmit={mode === 'create' ? 'Create Service' : 'Update Service'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="leding-[1.33] text-sm font-normal">
            Name
          </Label>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <Input
                id="name"
                placeholder="Enter service name"
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                className={cn(
                  'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none',
                  form.formState.errors.name && 'border-red-500'
                )}
                {...field}
              />
            )}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="category"
            className="leding-[1.33] text-sm font-normal"
          >
            Category
          </Label>
          <Controller
            name="category"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={cn(
                    'h-[56px]! w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none',
                    form.formState.errors.category && 'border-red-500'
                  )}
                  id="category"
                >
                  <SelectValue
                    className="text-muted-foreground text-sm leading-[1.33] font-normal"
                    placeholder="Select a category"
                  />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.category && (
            <p className="text-sm text-red-500">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="leding-[1.33] text-sm font-normal"
          >
            Description
          </Label>
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <Textarea
                id="description"
                placeholder="Enter service description"
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                className={cn(
                  'min-h-[6.75rem] w-full resize-none rounded-[16px] border border-[#2A3242] bg-transparent p-6 text-sm leading-normal focus:outline-none',
                  form.formState.errors.description && 'border-red-500'
                )}
                {...field}
              />
            )}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="gitRepoUrl"
              className="leding-[1.33] text-sm font-normal"
            >
              <GitIcon />
              Git Repository URL
            </Label>
            <Controller
              name="gitRepoUrl"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="gitRepoUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                  {...field}
                />
              )}
            />
            {form.formState.errors.gitRepoUrl && (
              <p className="text-sm text-red-500">
                {form.formState.errors.gitRepoUrl.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="gitRepoName"
              className="leding-[1.33] text-sm font-normal"
            >
              <GitIcon />
              Git Repository Name
            </Label>
            <Controller
              name="gitRepoName"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="gitRepoName"
                  placeholder="my-repo"
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                  {...field}
                />
              )}
            />
            {form.formState.errors.gitRepoName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.gitRepoName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="jiraProjectUrl"
              className="leding-[1.33] text-sm font-normal"
            >
              <JiraIcon />
              Jira Project URL
            </Label>
            <Controller
              name="jiraProjectUrl"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="jiraProjectUrl"
                  type="url"
                  placeholder="https://jira.example.com/..."
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                  {...field}
                />
              )}
            />
            {form.formState.errors.jiraProjectUrl && (
              <p className="text-sm text-red-500">
                {form.formState.errors.jiraProjectUrl.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="jiraProjectName"
              className="leding-[1.33] text-sm font-normal"
            >
              <JiraIcon />
              Jira Project Name
            </Label>
            <Controller
              name="jiraProjectName"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="jiraProjectName"
                  placeholder="PROJ"
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                  {...field}
                />
              )}
            />
            {form.formState.errors.jiraProjectName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.jiraProjectName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="slackChannelUrl"
              className="leding-[1.33] text-sm font-normal"
            >
              <SlackIcon />
              Slack Channel URL
            </Label>
            <Controller
              name="slackChannelUrl"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="slackChannelUrl"
                  type="url"
                  placeholder="https://workspace.slack.com/..."
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                  {...field}
                />
              )}
            />
            {form.formState.errors.slackChannelUrl && (
              <p className="text-sm text-red-500">
                {form.formState.errors.slackChannelUrl.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="slackChannelName"
              className="leding-[1.33] text-sm font-normal"
            >
              <SlackIcon />
              Slack Channel Name
            </Label>
            <Controller
              name="slackChannelName"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="slackChannelName"
                  placeholder="#service-updates"
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                  {...field}
                />
              )}
            />
            {form.formState.errors.slackChannelName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.slackChannelName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="teamId"
            className="leding-[1.33] flex items-center gap-2 text-sm font-normal"
          >
            Team
          </Label>
          <Controller
            name="teamId"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(val)}
              >
                <SelectTrigger
                  className={cn(
                    'h-[56px]! w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none',
                    form.formState.errors.teamId && 'border-red-500'
                  )}
                  id="teamId"
                >
                  <SelectValue
                    className="text-muted-foreground text-sm leading-[1.33] font-normal"
                    placeholder="Select a team"
                  />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.teamId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.teamId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="labels" className="leding-[1.33] text-sm font-normal">
            Labels
          </Label>
          <Controller
            name="labels"
            control={form.control}
            render={({ field }) => (
              <ComponentMetaThemeProvider theme="modal">
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Type and press Enter to add labels"
                />
              </ComponentMetaThemeProvider>
            )}
          />
        </div>
      </form>
    </BetterDialogContent>
  )
}
