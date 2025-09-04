// Merged from errorHelpers.mjs, bodyHelpers.mjs, sessionHelpers.mjs
export function sendError(res, status, message) {
	return res.status(status).json({ error: message })
}

export function requireBodyFields(res, body, fields) {
	for (const f of fields) {
		if (body == null || body[f] == null) {
			sendError(res, 400, `missing field: ${f}`)
			return false
		}
	}
	return true;
}

export function startSession(req, userId) {
	if (!req.session || typeof req.session !== 'object') req.session = {};
	req.session.userId = userId;
}

export function clearSession(req) {
	req.session = null;
}
