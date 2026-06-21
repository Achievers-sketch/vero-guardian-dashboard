/**
 * @jest-environment node
 */

import { POST } from './route';

describe('/api/feedback', () => {
  test('sanitizes and accepts valid feedback', async () => {
    const response = await POST(
      new Request('http://localhost/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          name: '<b>Ada</b>',
          email: 'ada@example.com',
          rating: 'Good',
          message: '<script>alert(1)</script>Improve navigation.',
          page: '/dashboard',
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.feedback).toEqual(
      expect.objectContaining({
        name: 'Ada',
        email: 'ada@example.com',
        message: 'alert(1)Improve navigation.',
        page: '/dashboard',
      }),
    );
  });

  test('rejects empty feedback messages', async () => {
    const response = await POST(
      new Request('http://localhost/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ message: '   ' }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
