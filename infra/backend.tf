# Terraform state in S3 (create bucket + versioning + DynamoDB for lock first).
# Uncomment after creating the bucket, or use: terraform init -backend-config=backend.hcl
#
# To bootstrap (run once):
#   aws s3 mb s3://YOUR_BUCKET --region us-east-1
#   aws s3api put-bucket-versioning --bucket YOUR_BUCKET --versioning-configuration Status=Enabled
#   aws dynamodb create-table --table-name terraform-state-lock --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1
#
terraform {
  backend "s3" {
    # bucket         = "YOUR_TERRAFORM_STATE_BUCKET"
    # key            = "learning-platform/terraform.tfstate"
    # region         = "us-east-1"
    # dynamodb_table = "terraform-state-lock"
    # encrypt        = true
  }
}
