import type { CloudProvider, ResourceType } from '../types'

/**
 * Hand-picked, per-provider icon for each resource type, sourced from the
 * icon sets already vendored for the diagram editor (aws-icons.json /
 * azure-icons.json manifests) plus a small original GCP set added for this
 * feature (public/gcp-icons). Not a generic manifest lookup — this feature
 * only ever needs these ~27 fixed icons.
 */
export const PROVIDER_ICON_MAP: Record<
  CloudProvider,
  Record<ResourceType, string>
> = {
  aws: {
    compute:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg',
    kubernetes:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-EKS-Cloud_64.svg',
    database:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg',
    storage:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
    queue:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg',
    load_balancer:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg',
    serverless:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg',
    cache:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-ElastiCache_64.svg',
    network:
      '/aws-icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  },
  azure: {
    compute: '/azure-icons/compute/10021-icon-service-Virtual-Machine.svg',
    kubernetes:
      '/azure-icons/compute/10023-icon-service-Kubernetes-Services.svg',
    database: '/azure-icons/databases/10130-icon-service-SQL-Database.svg',
    storage: '/azure-icons/storage/10086-icon-service-Storage-Accounts.svg',
    queue: '/azure-icons/integration/10836-icon-service-Azure-Service-Bus.svg',
    load_balancer:
      '/azure-icons/networking/10062-icon-service-Load-Balancers.svg',
    serverless: '/azure-icons/compute/10029-icon-service-Function-Apps.svg',
    cache: '/azure-icons/databases/10137-icon-service-Cache-Redis.svg',
    network: '/azure-icons/networking/10061-icon-service-Virtual-Networks.svg',
  },
  gcp: {
    compute: '/gcp-icons/compute-engine.svg',
    kubernetes: '/gcp-icons/gke.svg',
    database: '/gcp-icons/cloud-sql.svg',
    storage: '/gcp-icons/cloud-storage.svg',
    queue: '/gcp-icons/pubsub.svg',
    load_balancer: '/gcp-icons/load-balancing.svg',
    serverless: '/gcp-icons/cloud-functions.svg',
    cache: '/gcp-icons/memorystore.svg',
    network: '/gcp-icons/vpc-network.svg',
  },
}

export const PROVIDER_LOGO_MAP: Record<CloudProvider, string> = {
  aws: PROVIDER_ICON_MAP.aws.compute,
  azure: PROVIDER_ICON_MAP.azure.compute,
  gcp: '/gcp-icons/google-cloud.svg',
}
