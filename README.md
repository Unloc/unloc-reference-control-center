# Reference implementation for Unloc
This is an implementation of a simple control center using the Unloc Integrator API.

## Setup
```
git clone git@github.com:Unloc/frontend-reference-implementation.git
git clone git@github.com:Unloc/integrator-client-library.git
cd integrator-client-library && npm link && cd ..
cd frontend-reference-implementation
cd frontend && npm link integrator-client-library && cd ..
```

## Environment variables
Fill out the variables in .env.example
CLIENT_ID and CLIENT_SECRET are from your integrator account, if you do not have one contact unloc.
The API_ENDPOINT can either be https://api-sandbox.unloc.app for the sandbox environment or https://api.unloc.app for production.
PORT can be anything you want, but if  you want to set up development it must be the same as the proxy field in package.json in the frontend folder.

```
mv .env.example .env
npm run dev
```

