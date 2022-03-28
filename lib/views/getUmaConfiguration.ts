import { ViewFn } from '../types';

const getUmaConfiguration: ViewFn = (instance, request) => {
    const { user: requestUser } = request;
    if (!requestUser) {
        return [403, 'Access denied'];
    }

    return [
        200,
        {
            issuer: `http://localhost:8180/auth/realms/${instance.params.realm}`,
            authorization_endpoint: `http://localhost:8180/auth/realms/${instance.params.realm}/protocol/openid-connect/auth`,
            token_endpoint: `http://localhost:8180/auth/realms/${instance.params.realm}/protocol/openid-connect/token`,
            introspection_endpoint: `http://localhost:8180/auth/realms/${instance.params.realm}/protocol/openid-connect/token/introspect`,
            end_session_endpoint: `http://localhost:8180/auth/realms/${instance.params.realm}/protocol/openid-connect/logout`,
            frontchannel_logout_session_supported: true,
            frontchannel_logout_supported: true,
            jwks_uri: `http://localhost:8180/auth/realms/${instance.params.realm}/protocol/openid-connect/certs`,
            grant_types_supported: [
                `authorization_code`,
                `implicit`,
                `refresh_token`,
                `password`,
                `client_credentials`,
                `urn:ietf:params:oauth:grant-type:device_code`,
                `urn:openid:params:grant-type:ciba`,
            ],
            response_types_supported: [
                `code`,
                `none`,
                `id_token`,
                `token`,
                `id_token token`,
                `code id_token`,
                `code token`,
                `code id_token token`,
            ],
            response_modes_supported: [
                `query`,
                `fragment`,
                `form_post`,
                `query.jwt`,
                `fragment.jwt`,
                `form_post.jwt`,
                `jwt`,
            ],
            registration_endpoint: `http://localhost:8180/auth/realms/${instance.params.realm}/clients-registrations/openid-connect`,
            token_endpoint_auth_methods_supported: [
                `private_key_jwt`,
                `client_secret_basic`,
                `client_secret_post`,
                `tls_client_auth`,
                `client_secret_jwt`,
            ],
            token_endpoint_auth_signing_alg_values_supported: [
                `PS384`,
                `ES384`,
                `RS384`,
                `HS256`,
                `HS512`,
                `ES256`,
                `RS256`,
                `HS384`,
                `ES512`,
                `PS256`,
                `PS512`,
                `RS512`,
            ],
            scopes_supported: [
                `openid`,
                `profile`,
                `microprofile-jwt`,
                `offline_access`,
                `address`,
                `web-origins`,
                `phone`,
                `roles`,
                `email`,
            ],
            resource_registration_endpoint: `http://localhost:8180/auth/realms/${instance.params.realm}/authz/protection/resource_set`,
            permission_endpoint: `http://localhost:8180/auth/realms/${instance.params.realm}/authz/protection/permission`,
            policy_endpoint: `http://localhost:8180/auth/realms/${instance.params.realm}/authz/protection/uma-policy`,
        },
    ];
};

export default getUmaConfiguration;
