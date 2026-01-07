# Open Studio Form Status

## Infrastructure Status ✅

All AWS infrastructure is properly configured:

- ✅ **DynamoDB Table**: `OpenStudioWaitlist` exists and is active
- ✅ **Lambda Function**: `pottery-open-studio-handler` exists (Node.js 20.x)
- ✅ **API Gateway**: `/open-studio` resource exists with POST and OPTIONS methods
- ✅ **Email Configuration**: Using `Create@potterychicago.com` (verified email)

## Submissions Status ❌

**No submissions found in DynamoDB table.**

The table is empty, which means either:
1. No one has submitted the form yet
2. Form submissions are failing before reaching DynamoDB
3. There's a CORS or API endpoint issue

## Troubleshooting Steps

### 1. Check if the form is submitting
- Open browser console on https://potterychicago.com/open-studio
- Try submitting the form
- Look for any errors in the console
- Check Network tab to see if the API call is being made

### 2. Verify API endpoint
The form should be calling:
```
https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/open-studio
```

Check if this matches your `VITE_AWS_API_URL` environment variable (with `/booking` replaced by `/open-studio`).

### 3. Check CloudWatch Logs
Look for errors in the Lambda function logs:
```bash
aws logs tail /aws/lambda/pottery-open-studio-handler --follow --region us-east-2
```

### 4. Test the endpoint directly
```bash
curl -X POST https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/open-studio \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","courseDate":"2025-12-25"}'
```

### 5. Check CORS
The endpoint should return CORS headers. If you see CORS errors in the browser console, the OPTIONS method might not be configured correctly.

## Next Steps

1. **Test the form** on the live site and check browser console for errors
2. **Check CloudWatch logs** for any Lambda function errors
3. **Verify the API URL** in the frontend code matches the actual endpoint
4. **Test the endpoint directly** using curl or Postman

## Email Configuration

The Lambda function is already using the correct verified email address:
- `FROM_EMAIL = 'Create@potterychicago.com'` ✅

So if submissions start coming through, emails should work correctly.


