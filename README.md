# Keycloak Mock

[![License](https://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)
![Test](https://github.com/aktraore/keycloak-mock/actions/workflows/test.yml/badge.svg)

A minimal mock for a Keycloak server to be used in unit tests.

This mock is not complete and it definitely doesn't match Keycloak completely. Improvements are welcome.

## About
This does not launch an actual HTTP server. It uses [`nock`](https://github.com/nock/nock) to patch Node.js HTTP client to intercept requests.

Tested with Node.js 14.x

### What works
* `GET /[realm]/protocol/openid-connect/certs`
* `GET /[realm]/protocol/openid-connect/userinfo`
* `GET /admin/realms/[realm]/users`
* `GET /admin/realms/[realm]/users?username=myusername`
* `POST /[realm]/protocol/openid-connect/token`
* `GET /admin/realms/[realm]/users/[userid]`
* `DELETE /admin/realms/[realm]/users/[userid]`
* `POST /admin/realms/[realm]/users`
* `GET /realms/[realm]/.well-known/uma2-configuration`

## Usage
### Basic
    import * as KeycloakMock from "@aktraore/keycloak-mock";

    const keycloak = await KeycloakMock.createMockInstance({
        authServerURL: "https://myserver.com/auth",
        realm: "myrealm",
        clientID: "client-1",
        clientSecret: "test",
    });

    // all requests to `https://myserver.com/auth` will now be
    // intercepted and replied to
    const mock = KeycloakMock.activateMock(keycloak);

    // create a user and a token for it
    const user = keycloak.database.createUser({
        name: "test",
        email: "hello@hello.com", // username will be email
        credentials: [{
            value: "mypassword",
        }],
        roles: ['admin']
    });

    console.log(user.profile, user.credentials);

    const token = keycloak.createBearerToken(user.profile.id);

    // get active mock without a reference
    const sameMock = KeycloakMock.getMock("https://myserver.com/auth");

    // clear user database
    mock.instance.database.clear();

    // find user profile
    const sameUser = mock.instance.database.findUserByID(user.profile.id);

    // de-activate the mock
    KeycloakMock.deactivateMock(sameMock);

## Custom handlers

    import * as KeycloakMock from "keycloak-node-mock";

    const keycloak = await KeycloakMock.createMockInstance({
        authServerURL: "https://myserver.com/auth",
        realm: "myrealm",
        clientID: "client-1",
    });

    keycloak.activateMock(keycloak, {
       listCertificatesView: (instance, request) => {
           return [500, ""];
       },
       getUser: (instance, request) => {
           // might be null if not authorized
           console.log(request.user);
           return [500, ""];
       },
       deleteUser: (instance, request) => {
           return [500, ""];
       },
       getUserInfoView: (instance, request) => {
           return [500, ""];
       },
       listUsers: (instance, request) => {
           return [500, ""];
       },
       createTokenView: (instance, request, body) => {
           return [500, ""];
       },
       createUserView: (instance, request, body) => {
           return [500, ""];
       },
       getUmaConfiguration: (instance, request, body) => {
           return [500, ""];
       },
    });
