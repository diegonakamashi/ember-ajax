export const CRLF = '\u000d\u000a';
export default function parseResponseHeaders(headersString) {
  const headers = {};
  if (!headersString) {
    return headers;
  }
  return headersString.split(CRLF).reduce((hash, header) => {
    let [field, ...value] = header.split(':');
    field = field.trim();
    const valueString = value.join(':').trim();
    if (valueString) {
      hash[field] = valueString;
    }
    return hash;
  }, headers);
}
