from aws_cdk import (CfnOutput, Stack, aws_ec2, aws_rds, aws_s3,
                     aws_secretsmanager, aws_ssm)
from constructs import Construct


class SilaStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, vpc_id: str, api_ops_secret: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        website_bucket = aws_s3.Bucket(
            self,
            "WebsiteBucket",
            bucket_name="sila-prod-bucket",
        )

        vpc = aws_ec2.Vpc.from_lookup(self, "DefaultVPC", vpc_id=vpc_id)

        api_server_sg = aws_ec2.SecurityGroup(
            self,
            "ServerSG",
            vpc=vpc,
            allow_all_outbound=True
        )
        api_server_sg.add_ingress_rule(
            aws_ec2.Peer.any_ipv4(),
            aws_ec2.Port.tcp(22),
            description="Allow developers to ssh to server"
        )
        api_server_sg.add_ingress_rule(
            aws_ec2.Peer.any_ipv4(),
            aws_ec2.Port.tcp(3000),
            description="Allow for api hosting" 
        )

        api_server_sg.add_ingress_rule(
            aws_ec2.Peer.any_ipv4(),
            aws_ec2.Port.tcp(8080),
            description="Allow for api hosting" 
        )

        userdata_file = open("stack/user_data.sh", "rb").read()

        user_data = aws_ec2.UserData.for_linux()
        user_data.add_commands(str(userdata_file, 'utf-8'))

        api_server = aws_ec2.Instance(
            self,
            "KoalaApiServer",
            instance_name="koala-sila-api",
            instance_type=aws_ec2.InstanceType("t2.micro"),
            machine_image=aws_ec2.AmazonLinuxImage(),
            vpc=vpc,
            security_group=api_server_sg,
            key_name="sila",
            user_data=user_data
        )

        elastic_ip = aws_ec2.CfnEIP(
            self,
            "APIServerEIP"
        )
        aws_ec2.CfnEIPAssociation(
            self,
            "EIPAssociation",
            eip=elastic_ip.ref,
            instance_id=api_server.instance_id
        )

        api_ops = aws_secretsmanager.Secret.from_secret_name_v2(
            self,
            "ApiOpsSecret",
            secret_name=api_ops_secret
        )
        api_ops.grant_read(api_server)

        master_secret = aws_secretsmanager.Secret(
            self,
            "MasterSecretDB",
            generate_secret_string=aws_secretsmanager.SecretStringGenerator(
                secret_string_template='{"username":"admin"}',
                generate_string_key="password",
                password_length=32,
                exclude_characters='/@"\\\''
            )
        )
        master_secret.grant_read(api_server)

        # add to SSM
        master_secret_ssm = aws_ssm.StringParameter(
            self,
            "MasterSecretSSM",
            parameter_name="/sila-prod/master-secret",
            string_value=master_secret.secret_name
        )
        master_secret_ssm.grant_read(api_server)

        database_sg = aws_ec2.SecurityGroup(
            self,
            "DatabaseSG",
            vpc=vpc,
            allow_all_outbound=True
        )

        database_sg.add_ingress_rule(
            aws_ec2.Peer.any_ipv4(),
            aws_ec2.Port.tcp(3306),
            description="Allow incoming connections to the database"
        )

        database = aws_rds.DatabaseInstance(
            self,
            "SilaDB",
            instance_identifier="sila-prod-db",
            engine=aws_rds.DatabaseInstanceEngine.mysql(
                version=aws_rds.MysqlEngineVersion.VER_8_0_31
            ),
            multi_az=False,
            credentials=aws_rds.Credentials.from_secret(master_secret),
            instance_type=aws_ec2.InstanceType.of(
                aws_ec2.InstanceClass.BURSTABLE3,
                aws_ec2.InstanceSize.MICRO
            ),
            allocated_storage=10,
            vpc=vpc,
            vpc_subnets=aws_ec2.SubnetSelection(subnet_type=aws_ec2.SubnetType.PUBLIC),
            publicly_accessible=True,
            security_groups=[database_sg]
        )

        CfnOutput(self, "API_ENDPOINT", value=api_server.instance_public_dns_name)
        CfnOutput(self, "DB_ENDPOINT", value=database.db_instance_endpoint_address)
        CfnOutput(self, "MASTER_SECRET_NAME", value=master_secret.secret_name)

