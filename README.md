# Reference implementation for Unloc
This is an implementation of a simple control center using the Unloc Integrator API.

## Environment variables
Fill out the variables in .env.example
CLIENT_ID and CLIENT_SECRET are from your integrator account, if you do not have one contact unloc.
The API_ENDPOINT can either be https://api-sandbox.unloc.app for the sandbox environment or https://api.unloc.app for production.
PORT can be anything you want, but if  you want to set up development it must be the same as the proxy field in package.json in the frontend folder.

## Frontend variables
In the frontend/src/App.tsx there is a line with unloc.init("API_ENDPOINT"), this must be set to the same endpoint as is defined in the environment variables

```
mv .env.example .env
npm run dev
```

