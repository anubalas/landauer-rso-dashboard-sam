"""
Seed the compliance_rules DynamoDB table with sample RSO compliance data.

Usage:
    python scripts/seed_dynamodb.py [--region us-east-1] [--endpoint-url http://localhost:8000]

The --endpoint-url flag is for local DynamoDB (sam local).
"""
import argparse
import boto3
from botocore.exceptions import ClientError

RULES = [
    {
        "rule_id":     "rule-001",
        "name":        "Annual Dosimeter Calibration",
        "description": "All personal dosimeters must be calibrated annually by an accredited laboratory per 10 CFR 20.1501.",
        "category":    "Equipment",
        "regulation":  "10 CFR 20.1501",
        "status":      "NON_COMPLIANT",
    },
    {
        "rule_id":     "rule-002",
        "name":        "NRC Form 4 Quarterly Submission",
        "description": "Occupational dose records (NRC Form 4) must be submitted to the NRC within 30 days of the end of each quarter.",
        "category":    "Reporting",
        "regulation":  "10 CFR 20.2106",
        "status":      "NON_COMPLIANT",
    },
    {
        "rule_id":     "rule-003",
        "name":        "TLD Badge Exchange Cycle",
        "description": "Thermoluminescent dosimeter badges must be exchanged on the approved cycle (monthly/quarterly) to ensure accurate dose monitoring.",
        "category":    "Inventory",
        "regulation":  "10 CFR 20.1502",
        "status":      "COMPLIANT",
    },
    {
        "rule_id":     "rule-004",
        "name":        "Radiation Safety Training — New Personnel",
        "description": "All new radiation workers must complete RSO-approved radiation safety training before beginning work in restricted areas.",
        "category":    "Training",
        "regulation":  "10 CFR 19.12",
        "status":      "NEEDS_REVIEW",
    },
    {
        "rule_id":     "rule-005",
        "name":        "Quarterly Sealed Source Leak Test",
        "description": "Sealed radioactive sources must be tested for leakage at intervals not exceeding six months, or quarterly for high-activity sources.",
        "category":    "Inspection",
        "regulation":  "10 CFR 39.35",
        "status":      "NON_COMPLIANT",
    },
    {
        "rule_id":     "rule-006",
        "name":        "Emergency Response Procedure Review",
        "description": "Emergency response procedures must be reviewed and updated annually or following any significant incident.",
        "category":    "Regulation",
        "regulation":  "10 CFR 30.32",
        "status":      "NEEDS_REVIEW",
    },
    {
        "rule_id":     "rule-007",
        "name":        "Survey Meter Calibration",
        "description": "All radiation survey meters must be calibrated at intervals not exceeding 12 months and after servicing.",
        "category":    "Equipment",
        "regulation":  "10 CFR 20.1501(b)",
        "status":      "COMPLIANT",
    },
    {
        "rule_id":     "rule-008",
        "name":        "Radioactive Material License Renewal",
        "description": "Specific radioactive material licenses must be renewed before expiration. Renewal applications must be submitted at least 30 days prior.",
        "category":    "Regulation",
        "regulation":  "10 CFR 30.37",
        "status":      "COMPLIANT",
    },
    {
        "rule_id":     "rule-009",
        "name":        "Monthly Radiation Area Survey",
        "description": "Radiation surveys of all restricted and controlled areas must be performed monthly and documented.",
        "category":    "Inspection",
        "regulation":  "10 CFR 20.1501(a)",
        "status":      "COMPLIANT",
    },
    {
        "rule_id":     "rule-010",
        "name":        "Radioactive Waste Disposal Manifest",
        "description": "All radioactive waste shipments must be accompanied by a completed manifest and maintained on record for three years.",
        "category":    "Inventory",
        "regulation":  "10 CFR 20.2006",
        "status":      "COMPLIANT",
    },
    {
        "rule_id":     "rule-011",
        "name":        "Annual Occupational Dose Report",
        "description": "Annual reports of occupational radiation exposure must be submitted to the NRC by January 31 of the following year.",
        "category":    "Reporting",
        "regulation":  "10 CFR 20.2206",
        "status":      "NEEDS_REVIEW",
    },
    {
        "rule_id":     "rule-012",
        "name":        "Bioassay Program — Iodine Users",
        "description": "Personnel working with volatile radioiodine (I-125, I-131) must undergo thyroid bioassay at prescribed intervals.",
        "category":    "Inspection",
        "regulation":  "10 CFR 20.1204",
        "status":      "COMPLIANT",
    },
]


def seed(region: str, endpoint_url: str | None) -> None:
    kwargs = {"region_name": region}
    if endpoint_url:
        kwargs["endpoint_url"] = endpoint_url

    dynamodb = boto3.resource("dynamodb", **kwargs)
    table    = dynamodb.Table("compliance_rules")

    with table.batch_writer() as batch:
        for rule in RULES:
            batch.put_item(Item=rule)

    print(f"Seeded {len(RULES)} rules into compliance_rules table.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--region",       default="us-east-1")
    parser.add_argument("--endpoint-url", default=None, dest="endpoint_url")
    args = parser.parse_args()
    seed(args.region, args.endpoint_url)
