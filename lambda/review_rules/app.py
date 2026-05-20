import json
import os
import boto3
from boto3.dynamodb.conditions import Attr

TABLE_NAME = os.environ["TABLE_NAME"]
REGION     = os.environ.get("REGION", "us-east-1")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table    = dynamodb.Table(TABLE_NAME)

ALLOWED_ORIGINS = {
    "http://localhost:5174",
    "https://localhost:5174",
}


def _cors_headers(event: dict) -> dict:
    origin = (event.get("headers") or {}).get("origin", "")
    allowed = origin if origin in ALLOWED_ORIGINS else ""
    return {
        "Access-Control-Allow-Origin":  allowed,
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Content-Type":                 "application/json",
    }


def lambda_handler(event: dict, context) -> dict:
    headers = _cors_headers(event)

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {"statusCode": 204, "headers": headers, "body": ""}

    try:
        response = table.scan()
        items    = response.get("Items", [])

        # Handle DynamoDB pagination
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))

        rules = [
            {
                "id":          item["rule_id"],
                "name":        item.get("name", ""),
                "description": item.get("description", ""),
                "category":    item.get("category", ""),
                "regulation":  item.get("regulation", ""),
                "status":      item.get("status", "NEEDS_REVIEW"),
            }
            for item in items
        ]

        return {
            "statusCode": 200,
            "headers":    headers,
            "body":       json.dumps(rules),
        }

    except Exception as exc:
        return {
            "statusCode": 500,
            "headers":    headers,
            "body":       json.dumps({"error": str(exc)}),
        }
