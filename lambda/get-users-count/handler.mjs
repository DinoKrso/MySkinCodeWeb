import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME ?? "Users";
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME ?? "Products";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY?.trim();

/**
 * Paginirani Scan sa Select: COUNT.
 */
async function countTableItems(tableName, filter) {
  let total = 0;
  let exclusiveStartKey;

  do {
    const input = {
      TableName: tableName,
      Select: "COUNT",
      ExclusiveStartKey: exclusiveStartKey,
    };

    if (filter) {
      input.FilterExpression = filter.expression;
      input.ExpressionAttributeNames = filter.names;
      input.ExpressionAttributeValues = filter.values;
    }

    const result = await client.send(new ScanCommand(input));

    total += result.Count ?? 0;
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return total;
}

async function countProducts(tableName) {
  return countTableItems(tableName, {
    expression: "begins_with(#pk, :pkPrefix) AND #sk = :sk",
    names: {
      "#pk": "PK",
      "#sk": "SK",
    },
    values: {
      ":pkPrefix": { S: "PRODUCT#" },
      ":sk": { S: "META" },
    },
  });
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Admin-Key",
    },
    body: JSON.stringify(body),
  };
}

function isAuthorized(event) {
  if (!ADMIN_API_KEY) {
    return true;
  }

  const headers = event.headers ?? {};
  const provided =
    headers["x-admin-key"] ??
    headers["X-Admin-Key"] ??
    headers["authorization"]?.replace(/^Bearer\s+/i, "") ??
    headers["Authorization"]?.replace(/^Bearer\s+/i, "");

  return provided === ADMIN_API_KEY;
}

function requestPath(event) {
  return (
    event.rawPath ??
    event.path ??
    event.requestContext?.http?.path ??
    ""
  ).toLowerCase();
}

function isProductsCountRoute(event) {
  const path = requestPath(event);
  if (path.includes("/products/count")) return true;
  const type = event.queryStringParameters?.type?.toLowerCase();
  return type === "products" || type === "product";
}

/**
 * API Gateway handler — jedna Lambda, dvije rute:
 *
 * GET /admin/users/count    → { count, table }
 * GET /admin/products/count → { count, table, filter: "PRODUCT# + META" }
 */
export async function handler(event) {
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return jsonResponse(204, {});
  }

  if (!isAuthorized(event)) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const productsRoute = isProductsCountRoute(event);

  try {
    if (productsRoute) {
      const count = await countProducts(PRODUCTS_TABLE_NAME);

      return jsonResponse(200, {
        count,
        table: PRODUCTS_TABLE_NAME,
        filter: "PK begins_with PRODUCT# AND SK = META",
      });
    }

    const count = await countTableItems(USERS_TABLE_NAME);

    return jsonResponse(200, {
      count,
      table: USERS_TABLE_NAME,
    });
  } catch (err) {
    console.error(productsRoute ? "[admin/products/count]" : "[admin/users/count]", err);

    const message =
      err instanceof Error ? err.message : "Failed to count items";

    return jsonResponse(500, {
      error: productsRoute
        ? "Could not read product count from DynamoDB."
        : "Could not read user count from DynamoDB.",
      detail: message,
    });
  }
}
