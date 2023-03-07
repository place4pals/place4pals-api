export const website = async ({ event, pool }) => {
    //we're redirecting to a user profile based on a given username
    const response = await pool.query('SELECT id FROM users WHERE username=$1', [event.headers.Host.split('.')[0]]);
    const redirectDomain = event.headers.Host.split('.').slice(1).join('.');
    return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': response.rows.length > 0 ? `https://${redirectDomain}/users/${compressUuid(response.rows[0].id)}` : `https://${redirectDomain}` } };
}