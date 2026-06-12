# DynamoDB Schema JSON Guide

## Format

- Root: `table` object.
- Table: `name` string, `partitionKey` string, `sortKey` string, `gsis` array.
- GSI: `name` string, `partitionKey` string, `sortKey` string.

## Types

- Scalars: `string`, `number`, `boolean`.

## Example

```json
{
  "Type": "AWS::DynamoDB::Table",
  "Properties": {
    "TableName": "UserData",
    "BillingMode": "PAY_PER_REQUEST",
    "AttributeDefinitions": [
      { "AttributeName": "PK", "AttributeType": "S" },
      { "AttributeName": "SK", "AttributeType": "S" },
      { "AttributeName": "GSI1PK", "AttributeType": "S" },
      { "AttributeName": "GSI1SK", "AttributeType": "S" },
      { "AttributeName": "SomeField", "AttributeType": "S" }
    ],
    "KeySchema": [
      { "AttributeName": "PK", "KeyType": "HASH" },
      { "AttributeName": "SK", "KeyType": "RANGE" }
    ],
    "LocalSecondaryIndexes": [
      {
        "IndexName": "LSI1",
        "KeySchema": [
          { "AttributeName": "PK", "KeyType": "HASH" },
          { "AttributeName": "SomeField", "KeyType": "RANGE" }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      }
    ],
    "GlobalSecondaryIndexes": [
      {
        "IndexName": "GSI1",
        "KeySchema": [
          { "AttributeName": "GSI1PK", "KeyType": "HASH" },
          { "AttributeName": "GSI1SK", "KeyType": "RANGE" }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        },
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 5,
          "WriteCapacityUnits": 5
        }
      }
    ],
    "StreamSpecification": {
      "StreamViewType": "NEW_AND_OLD_IMAGES"
    },
    "TimeToLiveSpecification": {
      "AttributeName": "ttl",
      "Enabled": true
    },
    "SSESpecification": {
      "SSEEnabled": true,
      "SSEType": "KMS",
      "KMSMasterKeyId": "alias/aws/dynamodb"
    },
    "PointInTimeRecoverySpecification": {
      "PointInTimeRecoveryEnabled": true
    },
    "ProvisionedThroughput": {
      "ReadCapacityUnits": 5,
      "WriteCapacityUnits": 5
    },
    "DeletionProtectionEnabled": true,
    "ContributorInsightsSpecification": {
      "Enabled": true
    },
    "KinesisStreamSpecification": {
      "StreamArn": "arn:aws:kinesis:region:account:stream/name"
    },
    "Tags": [
      { "Key": "env", "Value": "prod" },
      { "Key": "project", "Value": "user-system" }
    ]
  }
}
```
