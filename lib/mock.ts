import qs from 'qs';
import nock, { Scope } from 'nock';

import { NockClientRequest, ViewFn, DeleteViewFn, PostViewFn } from './types';
import { MockInstance } from './instance';
import { decodeTokenAndAttachUser } from './middlewares';
import {
    listCertificates,
    getUser,
    deleteUser,
    getUserInfo,
    createToken,
    createUser,
    listUsers,
    getUmaConfiguration,
    getOpenIdConfiguration,
    validateToken,
} from './views';

let __activeMocks__: Map<string, Mock> = new Map<string, Mock>();

export interface Mock {
    scope: Scope;
    instance: MockInstance;
}

export interface MockOptions {
    listCertificatesView?: ViewFn;
    getUserView?: ViewFn;
    deleteUserView?: DeleteViewFn;
    getUserInfoView?: ViewFn;
    listUsersView?: ViewFn;
    getUmaConfiguration?: ViewFn;
    getOpenIdConfiguration?: ViewFn;
    createTokenView?: PostViewFn;
    createUserView?: PostViewFn;
    validateToken?: PostViewFn;
}

const decodeBody = (request: NockClientRequest, requestBody: unknown): {} => {
    const contentType = (request.headers['content-type'] || '').split(';')[0];

    switch (contentType) {
        case 'application/x-www-form-urlencoded':
            return qs.parse(requestBody as string);

        // JSON is handled by nock already
        default:
            return requestBody as {};
    }
};

const activateMock = (instance: MockInstance, options?: MockOptions): Mock => {
    const { authServerURL, realm, clientID } = instance.params;

    const existingMock = __activeMocks__.get(authServerURL);
    if (existingMock) {
        throw new Error(`There is an existing mock active for ${authServerURL}`);
    }

    const scope = nock(authServerURL)
        .persist()
        .get(`/realms/${realm}/protocol/openid-connect/certs`)
        .reply(async function () {
            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.listCertificatesView) {
                return options.listCertificatesView(instance, this.req);
            }

            return listCertificates(instance, this.req);
        })
        .get(new RegExp(`/admin/realms/${realm}/users/(.+)`))
        .reply(async function () {
            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.getUserView) {
                return options.getUserView(instance, this.req);
            }

            return getUser(instance, this.req);
        })
        .delete(new RegExp(`/admin/realms/${realm}/users/(.+)`))
        .reply(async function () {
            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.deleteUserView) {
                return options.deleteUserView(instance, this.req);
            }

            return deleteUser(instance, this.req);
        })
        .get(`/realms/${realm}/protocol/openid-connect/userinfo`)
        .reply(async function () {
            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.getUserInfoView) {
                return options.getUserInfoView(instance, this.req);
            }

            return getUserInfo(instance, this.req);
        })
        .get(`/admin/realms/${realm}/users`)
        .query(() => true)
        .reply(async function () {
            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.listUsersView) {
                return options.listUsersView(instance, this.req);
            }

            return listUsers(instance, this.req);
        })
        .get(`/realms/${realm}/.well-known/uma2-configuration`)
        .reply(async function () {
            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.getUmaConfiguration) {
                return options.getUmaConfiguration(instance, this.req);
            }

            return getUmaConfiguration(instance, this.req);
        })
        .get(`/realms/${realm}/.well-known/openid-configuration`)
        .reply(async function () {
            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.getOpenIdConfiguration) {
                return options.getOpenIdConfiguration(instance, this.req);
            }

            return getOpenIdConfiguration(instance, this.req);
        })
        .post(`/realms/${realm}/protocol/openid-connect/token`)
        .reply(async function (uri, body) {
            const decodedBody = decodeBody(this.req, body);

            if (options && options.createTokenView) {
                return options.createTokenView(instance, this.req, decodedBody);
            }

            return createToken(instance, this.req, decodedBody);
        })
        .post(`/realms/${realm}/protocol/openid-connect/token/introspect`)
        .reply(async function (uri, body) {
            const decodedBody = decodeBody(this.req, body);

            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.validateToken) {
                return options.validateToken(instance, this.req, decodedBody);
            }

            return validateToken(instance, this.req, decodedBody);
        })
        .post(`/admin/realms/${realm}/users`)
        .reply(async function (uri, body) {
            const decodedBody = decodeBody(this.req, body);

            await decodeTokenAndAttachUser(instance, this.req);

            if (options && options.createUserView) {
                return options.createUserView(instance, this.req, decodedBody);
            }

            return createUser(instance, this.req, decodedBody);
        });

    const mock = { scope, instance };
    __activeMocks__.set(authServerURL, mock);

    return mock;
};

const deactivateMock = (mock: Mock): void => {
    const { authServerURL } = mock.instance.params;

    const existingMock = __activeMocks__.get(authServerURL);
    if (!existingMock) {
        throw new Error(`No active mock for ${authServerURL}`);
    }

    __activeMocks__.delete(authServerURL);

    mock.scope.persist(false);

    // @ts-ignore
    mock.scope.keyedInterceptors = {};

    // @ts-ignore
    mock.scope.interceptors = [];
};

const getMock = (authServerURL: string): Mock => {
    const mock = __activeMocks__.get(authServerURL);
    if (!mock) {
        throw new Error(`No active mock for ${authServerURL}`);
    }

    return mock;
};

const getMockInstance = (authServerURL: string): MockInstance => {
    return getMock(authServerURL).instance;
};

export { activateMock, deactivateMock, getMock, getMockInstance };
