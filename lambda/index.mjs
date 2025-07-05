import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  ScanCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.TABLE_NAME; 

export const handler = async (event) => {
  console.log('event', event);
  console.log('event.headers', event.headers);
  // Stablish CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'http://resume-lynx-pardelle.s3-website-us-east-1.amazonaws.com,https://resume.lynxpardelle.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST',
  };
  // Check for Allowed Origin
  if (!event.headers?.origin || !headers['Access-Control-Allow-Origin'].split(',').includes(event.headers.origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify('Forbidden')
    }
  }
  const validMethods = headers['Access-Control-Allow-Methods'].replace(/\s/g, '').split(',');
  const method = event.httpMethod || event.method || event.headers.httpMethod || event.headers.method || event.requestContext?.http?.method;
  // Check for Allowed Methods
  if (!validMethods.find((m) => m === method)) {
    return {
      statusCode: 405,
      body: JSON.stringify('Method Not Allowed')
    }
  }
  // Check if is post or get
  if (method === 'POST') {
    const { comment } = JSON.parse(event.body || "{}");
    const item = {
      pk: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      userAgent: event.headers["user-agent"],
      comment,
      valid: false,
    };
    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    // Return the data
    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } else if (method === 'GET') {
    const data = await ddb.send(
      new ScanCommand({
        TableName: TABLE,
        FilterExpression: "#v = :v",
        ExpressionAttributeNames: { "#v": "valid" },
        ExpressionAttributeValues: { ":v": true },
        Limit: 20
      })
    );
    console.log('data', data);
    if (!data) {
      return {
        statusCode: 404,
        body: JSON.stringify('No comments found!')
      }
    }
    // Return the data
    return {
      statusCode: 200,
      body: JSON.stringify(data.items || []),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda Resume Lynx Pardelle Comment!'),
  };
};
