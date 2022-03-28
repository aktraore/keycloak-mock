import axios from 'axios';

import * as KeycloakMock from '../lib';
import { setupBefore, teardownAfter, getMockInstance } from './util';

describe('getUmaConfiguration', () => {
    beforeAll(setupBefore);
    afterAll(teardownAfter);

    it('rejects with 403 without token', async () => {
        const kmock = getMockInstance();
        const url = kmock.createURL(`/realms/${kmock.params.realm}/.well-known/uma2-configuration`);

        const response = await axios.get(url, { validateStatus: () => true });
        expect(response.status).toBe(403);
    });

    it('works with token', async () => {
        const kmock = getMockInstance();

        const user = kmock.database.users[0];
        const token = kmock.createBearerToken(user.profile.id);

        const url = kmock.createURL(`/realms/${kmock.params.realm}/.well-known/uma2-configuration`);

        const response = await axios.get(url, {
            headers: { authorization: `Bearer ${token}` },
        });
        expect(response.data).toMatchSnapshot();
    });
});
