import axios from 'axios';
import { setupBefore, teardownAfter, getMockInstance } from './util';

describe('createUser', () => {
    beforeAll(setupBefore);
    afterAll(teardownAfter);

    const createInstanceAndURL = () => {
        const kmock = getMockInstance();
        const url = kmock.createURL(
            `/realms/${kmock.params.realm}/protocol/openid-connect/token/introspect`,
        );

        const serviceUser = kmock.database.findServiceUser();
        if (!serviceUser) {
            throw new Error('Cannot find service user');
        }

        const token = kmock.createBearerToken(serviceUser.profile.id);

        return { kmock, url, token, serviceUser };
    };

    it('rejects with 403 without token', async () => {
        const { kmock, url } = createInstanceAndURL();

        const response = await axios.post(url, {}, { validateStatus: () => true });
        expect(response.status).toBe(403);
    });
    it('validates token', async () => {
        const { kmock, url, token, serviceUser } = createInstanceAndURL();

        const { status, data, headers } = await axios.post(
            url,
            {},
            {
                headers: {
                    authorization:
                        'Basic ' +
                        Buffer.from(
                            `${serviceUser.profile.username}:${serviceUser.credentials[0].value}`,
                        ).toString('base64'),
                },
                validateStatus: () => true,
            },
        );

        expect(status).toBe(200);
        expect(data.active).toBeTruthy();
    });
});
