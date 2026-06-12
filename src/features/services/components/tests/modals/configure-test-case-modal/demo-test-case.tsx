import { Button } from '@/components/ui/button'
import { FormType } from './schema'

export function DemoTestCase({ form }: { form: FormType }) {
  return (
    <div className="mb-4 rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] p-3">
      <div className="mb-2 text-[11px] font-bold tracking-[0.08em] text-[#64748b] uppercase">
        Demo Autofill
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <Button
          type="button"
          preset="outline"
          onClick={() => {
            form.reset({
              title: 'Verify user can update profile from settings',
              description:
                'Ensures profile edits are saved and reflected in the account summary.',
              type: 'manual',
              priority: 'p1',
              tags: ['smoke', 'settings', 'profile'],
              linkedTicket: 'QA-1241',
              estimatedMins: '8',
              testOwner: '@qa.sarah',
              linkedMapNode: '',
              evidenceRequired: true,
              critical: false,
              preconditions: 'User account exists and user is logged in.',
              testData: 'New display name: Sarah K.',
              steps: [
                {
                  action: 'Open settings and navigate to Profile section.',
                  expected: 'Current profile details are visible.',
                },
                {
                  action: 'Update the display name and click Save.',
                  expected:
                    'Success toast is shown and save button is disabled again.',
                },
                {
                  action: 'Refresh the page and revisit Profile section.',
                  expected: 'Updated display name persists after reload.',
                },
              ],
              expectedOutcome:
                'Profile updates are persisted and visible across account surfaces.',
              postconditions: 'Reset display name back to original value.',
            })
          }}
          className="h-9 rounded-[8px] px-2 text-xs"
        >
          Manual Demo
        </Button>

        <Button
          type="button"
          preset="outline"
          onClick={() => {
            form.reset({
              title: 'Create payment intent returns 201 with valid payload',
              description:
                'Validates the payments create endpoint for status, latency, and key fields.',
              type: 'api',
              priority: 'p0',
              tags: ['api', 'payments', 'regression'],
              linkedTicket: 'PAY-903',
              estimatedMins: '5',
              testOwner: '@qa.api',
              linkedMapNode: '',
              evidenceRequired: false,
              critical: true,
              httpMethod: 'POST',
              apiSpec: 'payments',
              operation: 'post-pay',
              authType: 'Bearer Token',
              authValue: '{{AUTH_TOKEN}}',
              headers: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'x-request-id', value: 'demo-request-001' },
              ],
              queryParams: [{ key: 'expand', value: 'customer' }],
              requestBody:
                '{\n  "amount": 2599,\n  "currency": "USD",\n  "customerId": "cus_demo_01"\n}',
              expectedStatus: '201',
              responseTimeMs: '1200',
              responseBody:
                '{\n  "id": "pi_123",\n  "status": "requires_payment_method",\n  "amount": 2599\n}',
              assertions: [
                {
                  field: 'status',
                  type: 'equals',
                  value: 'requires_payment_method',
                },
                { field: 'amount', type: 'equals', value: '2599' },
              ],
            })
          }}
          className="h-9 rounded-[8px] px-2 text-xs"
        >
          API Demo
        </Button>

        <Button
          type="button"
          preset="outline"
          onClick={() => {
            form.reset({
              title: 'Get current user profile returns id and email',
              description:
                'Checks GraphQL query execution, response payload, and core assertions.',
              type: 'graphql',
              priority: 'p1',
              tags: ['graphql', 'profile'],
              linkedTicket: 'GQL-312',
              estimatedMins: '4',
              testOwner: '@qa.graph',
              linkedMapNode: '',
              evidenceRequired: false,
              critical: false,
              gqlType: 'Query',
              gqlName: 'GetMe',
              gqlQuery:
                'query GetMe {\n  me {\n    id\n    email\n    plan\n  }\n}',
              gqlVariables: '{\n  "withPlan": true\n}',
              gqlResponseBody:
                '{\n  "data": {\n    "me": {\n      "id": "usr_123",\n      "email": "demo@company.com",\n      "plan": "pro"\n    }\n  }\n}',
              gqlAssertions: [
                { field: 'data.me.id', type: 'is not empty', value: '' },
                { field: 'data.me.email', type: 'contains', value: '@' },
              ],
              gqlExpectError: false,
            })
          }}
          className="h-9 rounded-[8px] px-2 text-xs"
        >
          GraphQL Demo
        </Button>

        <Button
          type="button"
          preset="outline"
          onClick={() => {
            form.reset({
              title: 'Order insert persists expected row in orders table',
              description:
                'Verifies core order write path and data integrity in persistence layer.',
              type: 'database',
              priority: 'p1',
              tags: ['database', 'orders'],
              linkedTicket: 'DB-448',
              estimatedMins: '6',
              testOwner: '@qa.db',
              linkedMapNode: '',
              evidenceRequired: false,
              critical: true,
              dbDialect: 'PostgreSQL',
              dbSchema: 'payments',
              dbQuery:
                'SELECT id, status, total_cents\nFROM orders\nWHERE id = 10001;',
              dbAssertions: [
                { field: 'row count', type: 'row count equals', value: '1' },
                { field: 'status', type: 'column equals', value: 'created' },
              ],
              dbSetup:
                "INSERT INTO orders (id, status, total_cents) VALUES (10001, 'created', 2599);",
              dbCleanup: 'DELETE FROM orders WHERE id = 10001;',
            })
          }}
          className="h-9 rounded-[8px] px-2 text-xs"
        >
          Database Demo
        </Button>

        <Button
          type="button"
          preset="outline"
          onClick={() => {
            form.reset({
              title: 'CreateShipment unary call returns OK with shipment id',
              description:
                'Confirms gRPC request contract and response integrity for shipment flow.',
              type: 'grpc',
              priority: 'p2',
              tags: ['grpc', 'shipping'],
              linkedTicket: 'GRPC-109',
              estimatedMins: '7',
              testOwner: '@qa.grpc',
              linkedMapNode: '',
              evidenceRequired: false,
              critical: false,
              grpcService: 'shipping.ShipmentService',
              grpcMethod: 'CreateShipment',
              grpcMode: 'Unary',
              grpcProto: 'shipping-v1.proto',
              grpcAddress: 'shipping.internal:443',
              grpcRequest:
                '{\n  "orderId": "ord_987",\n  "carrier": "DHL",\n  "priority": "EXPRESS"\n}',
              grpcMetadata: [
                { key: 'authorization', value: 'Bearer {{TOKEN}}' },
              ],
              grpcExpectedStatus: 'OK',
              grpcDeadline: '2000',
              grpcResponseBody:
                '{\n  "shipmentId": "shp_321",\n  "status": "CREATED"\n}',
              grpcAssertions: [
                { field: 'shipmentId', type: 'field exists', value: 'true' },
                { field: 'status', type: 'equals', value: 'CREATED' },
              ],
              grpcTLS: true,
              grpcExpectError: false,
            })
          }}
          className="h-9 rounded-[8px] px-2 text-xs"
        >
          gRPC Demo
        </Button>
      </div>
    </div>
  )
}
