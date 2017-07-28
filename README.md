# lambda-ghost
phantomjs sample in aws-lambda by node-lambda

## how to setup
```
$ npm install
$ npm run setup
```

## how to run
```
$ npm run invoke
```

## how to deploy

```
### for deplyment, overwrite your lambda role arn & region & function name(OS X example bellow)
sed -i '' 's/\(AWS_ROLE_ARN=\).*/\1<your_lambda_arn>/' .env
sed -i '' 's/\(AWS_REGION=\).*/\1<your_region>/' .env
sed -i '' 's/\(AWS_FUNCTION_NAME=\).*/\1<your_lambda_name>/' .env
```

If you don't have set up aws-cli yet, fill AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY.
