#!/bin/bash

# Configuration
PROFILE="place4pals"
STACK_NAME="place4pals-api"
CHANGE_SET_NAME="change-set-$(date +%Y%m%d%H%M%S)"

# Function to log messages
log() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# Create Change Set
log "Creating change set..."
CHANGE_SET_ID=$(aws --profile $PROFILE cloudformation create-change-set \
  --stack-name $STACK_NAME \
  --template-body file://template.yaml \
  --parameters $PARAMETERS_BODY \
  --change-set-name $CHANGE_SET_NAME \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --change-set-type UPDATE \
  --query 'Id' --output text)

if [ $? -ne 0 ]; then
  log "Error creating change set"
  exit 1
fi

log "Change set ID: $CHANGE_SET_ID"

# Wait until the change set is created
log "Waiting for change set creation to complete..."
aws --profile $PROFILE cloudformation wait change-set-create-complete \
  --stack-name $STACK_NAME \
  --change-set-name $CHANGE_SET_NAME

if [ $? -ne 0 ]; then
  log "Error waiting for change set creation"
  
  # Describe the change set to get the reason for failure
  log "Describing change set for failure details..."
  aws --profile $PROFILE cloudformation describe-change-set \
    --stack-name $STACK_NAME \
    --change-set-name $CHANGE_SET_NAME
  
  exit 1
fi

# Describe Change Set
log "Describing change set..."
aws --profile $PROFILE cloudformation describe-change-set \
  --stack-name $STACK_NAME \
  --change-set-name $CHANGE_SET_NAME

if [ $? -ne 0 ]; then
  log "Error describing change set"
  exit 1
fi

# Execute Change Set
log "Executing change set..."
aws --profile $PROFILE cloudformation execute-change-set \
  --stack-name $STACK_NAME \
  --change-set-name $CHANGE_SET_NAME

if [ $? -ne 0 ]; then
  log "Error executing change set"
  exit 1
fi

log "Change set executed successfully."
