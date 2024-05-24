#!/usr/bin/env python3
import os

import aws_cdk as cdk
from stack.sila_stack import SilaStack

app = cdk.App()

AWS_ACCOUNT_ID = app.node.get_context("AWS_ACCOUNTID")
env_sila = cdk.Environment(account=AWS_ACCOUNT_ID, region="ap-southeast-2")

SilaStack(app, "Sila", vpc_id=app.node.get_context("VPC_ID"), api_ops_secret="ApiOps", env=env_sila)

app.synth()
