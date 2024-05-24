#!/bin/bash 

yum update -y

# install jq in the server to filter secrets
yum install jq -y

sudo -u ec2-user sh -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash'
sudo -u ec2-user sh -c 'source ~/.bashrc'
sudo -u ec2-user sh -c '. ~/.nvm/nvm.sh && nvm install 16 && npm install -g nodemon && npm install forever -g'

sudo -u ec2-user sh -c 'node -e "console.log('Running Node.js ' + process.version)"'

MASTER_SECRET_ID=$(aws ssm get-parameter --name "/sila-prod/master-secret" --region ap-southeast-2\
             --query "Parameter.Value" --output text)

# Pass the secrets to the server
DB_USER=$(aws secretsmanager get-secret-value --secret-id $MASTER_SECRET_ID\
            --region ap-southeast-2 --query 'SecretString' --output text | jq -r '.username')
DB_PWD=$(aws secretsmanager get-secret-value --secret-id $MASTER_SECRET_ID\
            --region ap-southeast-2 --query 'SecretString' --output text | jq -r '.password')
DB_HOST=$(aws secretsmanager get-secret-value --secret-id $MASTER_SECRET_ID\
            --region ap-southeast-2 --query 'SecretString' --output text | jq -r '.host')

EMAIL=$(aws secretsmanager get-secret-value --secret-id ApiOps\
            --region ap-southeast-2 --query 'SecretString' --output text | jq -r '.EMAIL')
EMAIL_PASSWORD=$(aws secretsmanager get-secret-value --secret-id ApiOps\
            --region ap-southeast-2 --query 'SecretString' --output text | jq -r '.EMAIL_PASSWORD')
JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id ApiOps\
            --region ap-southeast-2 --query 'SecretString' --output text | jq -r '.JWT_SECRET')


touch /etc/profile.d/script.sh

echo "export DB_USER=\"$DB_USER\"" >> /etc/profile.d/script.sh
echo "export DB_PWD=\"$DB_PWD\"" >> /etc/profile.d/script.sh
echo "export DB_HOST=\"$DB_HOST\"" >> /etc/profile.d/script.sh
echo "export EMAIL=\"$EMAIL\"" >> /etc/profile.d/script.sh
echo "export EMAIL_PASSWORD=\"$EMAIL_PASSWORD\"" >> /etc/profile.d/script.sh
echo "export JWT_SECRET=\"$JWT_SECRET\"" >> /etc/profile.d/script.sh
echo "export DB_PORT=3306" >> /etc/profile.d/script.sh
echo "export DB_NAME=\"sila_prod_db\"" >> /etc/profile.d/script.sh
echo "export TEST_DB_NAME=\"sila_test_db\"" >> /etc/profile.d/script.sh

cp /etc/profile.d/script.sh /home/ec2-user/.env

