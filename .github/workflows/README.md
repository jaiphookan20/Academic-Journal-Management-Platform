# GitHub Actions Workflows

GitHub Actions workflows are a way to orchestrate various CI/CD operations using GitHub Actions provided servers. 

## Table of Contents
- [Local Self Hosted Runners](#local-self-hosted-runners)
    - [How to Setup Self Hosted Runners](#how-to-setup-self-hosted-runners)
    - [SI-Koala GitHub Actions Labels](#si-koala-github-actions-labels)
- [Frontend Deploy](#frontend-deploy)
- [Backend Deploy](#backend-deploy)
    - [SSH and SCP for self-hosted runners](#ssh-and-scp-for-self-hosted-runners)
- [Backend Test](#backend-test)
- [AWS Deployment](#aws-deployment)
- [MySQL Deploy Prod](#mysql-deploy-prod)
- [Scope](#scope)

## Local Self Hosted Runners
- To conserve GitHub Actions compute minutes, we run GitHub Actions on our local machine instead of the `Larger GitHub-hosted runners` and `Standard GitHub-hosted runner`. From a development standpoint, it has minimal impacts on how developers utilise DevOps, however, it makes automation much more **AFFORDABLE**.

### How to Setup Self Hosted Runners?
- Repository -> Settings -> Code and Automation -> Actions -> Runners -> **NEW SELF-HOSTED RUNNER**
- Select *your* laptop's configuration (os: macOS/Linux/Windows Arc: x64, ARM64, ARM) and follow the steps provided in the UI.
- It is advisable to create `actions-runner` folder in the root directory.
- There are two steps in the setup process: `download` and `configure`.
    - `download`: Downloads the GitHub Actions package on your machine and extracts the installer.
    - `configure`: Using the token, you authorize the runner to access the repo.
- More about `config`
    - Most of the steps can be allowed to have default values.
    - We have made sure that the `name of the runner` has the name of the user eg (`Rishabhs-MacBook-Pro`)
    - Lastly, labels are the most important thing in this setup. By default you will get values like `self-hosted`, `macOS`, etc. You can add more labels here and they can be used in your workflows to filter which runner to use for the build. 
        - Example: A runner can have a label `android` and you can specific `runs-on: android` for your android builds. 
- Lastly, make sure that the runner is running on your machine using `./run.sh` and don't exit the terminal.
- If you got to Repository -> Settings -> Code and Automation -> Actions -> Runners, you should be able to see the newly created runner in status `Idle` which means it is ready to start picking up your GitHub Actions jobs. As long as your workflow uses the correct labels (`self-hosted`, `macOS`, etc), it should get picked up. Happy days! :rocket

### SI-Koala GitHub Actions Labels
- During the setup of your local runner, add below labels:
    1. `self-hosted`
    2. `sila-koala`
    3. `sila`

## Frontend Deploy
- Runs when the code inside `frontend/` changes. 
- In the run, the frontend project is built using `npm install` and `npm run build` and the artifacts are uploaded to an AWS S3 bucket. 

## Backend Deploy
- Runs when the code inside `backend/` changes.
- The workflow copies the files from `backend/` to the remote AWS EC2 server using SCP.
- After the files are copies, the workflow logs into the server using SSH and build the node project using `npm install` and starts the server using `forever start server.js`.

### SSH and SCP for self-hosted runners
- If you have a self-hosted configure the ssh config like below
    ```
    Host sila_prod 
        HostName api+host+on+aws
        User server+api
        Port 22 
        IdentityFile path+to+the+private key
    ```

## Backend Test
- Runs when there is PR created to `main` and the code inside `backend/` has changed.
- Deploys a `sila_test_db` to the remote database server and runs the test cases using `npm test`.

## AWS Deployment
- Runs when the code inside `aws/` changes.
- Deploys the code changes to the AWS account.

## MySQL Deploy Prod
- Runs when the code inside `data/views/**` changes
- Runs to *ONLY* deploy the views to the production database.

## Scope
- Keep build time low and hence only trigger on push to `main`.