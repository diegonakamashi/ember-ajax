import Mixin from '@ember/object/mixin';
import { isArray } from '@ember/array';
import { isNone } from '@ember/utils';
import isString from '../../-private/utils/is-string';
function isObject(object) {
  return typeof object === 'object';
}
function isJsonApiErrorResponse(object) {
  if (!isObject(object)) {
    return false;
  }
  const payloadAsErrorResponse = object;
  if (payloadAsErrorResponse.errors) {
    return isArray(payloadAsErrorResponse.errors);
  }
  return false;
}
function isJsonApiErrorObjectArray(object) {
  return isArray(object);
}
export default Mixin.create({
  /**
   * Normalize the error from the server into the same format
   *
   * The format we normalize to is based on the JSON API specification.  The
   * return value should be an array of objects that match the format they
   * describe. More details about the object format can be found
   * [here](http://jsonapi.org/format/#error-objects)
   *
   * The basics of the format are as follows:
   *
   * ```javascript
   * [
   *   {
   *     status: 'The status code for the error',
   *     title: 'The human-readable title of the error'
   *     detail: 'The human-readable details of the error'
   *   }
   * ]
   * ```
   *
   * In cases where the server returns an array, then there should be one item
   * in the array for each of the payload.  If your server returns a JSON API
   * formatted payload already, it will just be returned directly.
   *
   * If your server returns something other than a JSON API format, it's
   * suggested that you override this method to convert your own errors into the
   * one described above.
   */
  normalizeErrorResponse(status, _headers, payload) {
    payload = isNone(payload) ? {} : payload;
    if (isJsonApiErrorResponse(payload)) {
      return payload.errors.map(function(error) {
        if (isObject(error)) {
          const ret = Object.assign({}, error);
          ret.status = `${error.status}`;
          return ret;
        } else {
          return {
            status: `${status}`,
            title: error
          };
        }
      });
    } else if (isJsonApiErrorObjectArray(payload)) {
      return payload.map(function(error) {
        if (isObject(error)) {
          return {
            status: `${status}`,
            title: error.title || 'The backend responded with an error',
            detail: error
          };
        } else {
          return {
            status: `${status}`,
            title: `${error}`
          };
        }
      });
    } else if (isString(payload)) {
      return [
        {
          status: `${status}`,
          title: payload
        }
      ];
    } else {
      return [
        {
          status: `${status}`,
          title: payload.title || 'The backend responded with an error',
          detail: payload
        }
      ];
    }
  }
});
