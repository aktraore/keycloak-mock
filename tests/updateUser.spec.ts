import axios from 'axios';
import { setupBefore, teardownAfter, getMockInstance } from './util';

describe('updateUser', () => {
    beforeAll(setupBefore);
    afterAll(teardownAfter);

    const createInstanceAndURL = () => {
        const kmock = getMockInstance();
        const updateUrl = kmock.createURL(`/admin/realms/${kmock.params.realm}/users/(.+)`);
        const createUrl = kmock.createURL(`/admin/realms/${kmock.params.realm}/users`);

        const serviceUser = kmock.database.findServiceUser();
        if (!serviceUser) {
            throw new Error('Cannot find service user');
        }

        const token = kmock.createBearerToken(serviceUser.profile.id);

        return { kmock, updateUrl, createUrl, token };
    };

    it('rejects with 403 without token', async () => {
        const { kmock, updateUrl: url } = createInstanceAndURL();

        const response = await axios.put(url, {}, { validateStatus: () => true });
        expect(response.status).toBe(403);
    });

    it('returns 404 when user does not exist', async () => {
        const { kmock, updateUrl: url, token } = createInstanceAndURL();

        const { status } = await axios.put(
            url,
            {
                id: 'toto',
            },
            {
                headers: { authorization: `Bearer ${token}` },
                validateStatus: () => true,
            },
        );

        expect(status).toBe(404);
    });

    it('returns 200 and updates a user', async () => {
        const { kmock, updateUrl, createUrl, token } = createInstanceAndURL();

        const { status, data, headers } = await axios.post(
            createUrl,
            {
                username: 'otheruser',
                email: 'otheruser@test.com',
                enabled: true,
                totp: false,
                emailVerified: true,
                firstName: 'my',
                lastName: 'user',
                attributes: {
                    test: ['a'],
                },
                credentials: [
                    {
                        value: 'test',
                    },
                ],
            },
            {
                headers: { authorization: `Bearer ${token}` },
                validateStatus: () => true,
            },
        );

        expect(status).toBe(200);
        expect(data.id).toBeTruthy();

        expect(kmock.database.findUserByID(data.id)).toBeTruthy();

        const { data: updatedData } = await axios.put(
            `${updateUrl}`,
            {
                id: data.id,
                username: 'otheruser',
                enabled: true,
                totp: false,
                emailVerified: true,
                firstName: 'updated',
                lastName: 'user2',
                attributes: {
                    test: ['a'],
                },
            },
            {
                headers: { authorization: `Bearer ${token}` },
                validateStatus: () => true,
            },
        );
    });
});
