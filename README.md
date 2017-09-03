# no-reseller-amazon
amazon stock checker without reseller.

## how to setup
```
$ yarn install
$ yarn setup

### edit AWS_FUNCTION_NAME in .env
$ sed -i '' 's/\(AWS_FUNCTION_NAME=\).*/\1"<your_lambda_name>"/' deploy.env

### edit TARGET_ITEM_LINK in deploy.env
$ sed -i '' 's/\(TARGET_ITEM_LINK=\).*/\1"<your_target_item_link>"/' deploy.env

### edit SLACK_CHANNEL in deploy.env
$ sed -i '' 's/\(SLACK_CHANNEL=\).*/\1"<your_slack_channel>"/' deploy.env

### if you change notify message, edit NOTIFY_MESSAGE in deploy.env
$ sed -i '' 's/\(NOTIFY_MESSAGE=\).*/\1"<your_notify_message>"/' deploy.env

```

## how to run
```
$ yarn start
```

## how to deploy

```
### for deplyment, overwrite your lambda role arn & region & function name(OS X example bellow)
$ sed -i '' 's/\(AWS_ROLE_ARN=\).*/\1<your_lambda_arn>/' .env
$ sed -i '' 's/\(AWS_REGION=\).*/\1<your_region>/' .env
$ sed -i '' 's/\(AWS_FUNCTION_NAME=\).*/\1<your_lambda_name>/' .env

$ yarn deploy
```

If you don't have set up aws-cli yet, fill AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY.
