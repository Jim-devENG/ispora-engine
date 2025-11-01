/**
 * Safe String Utilities
 * Prevents TypeError when calling string methods on undefined/null values
 */

export const safeString = {
  /**
   * Safely get first character of a string
   * @param {string|undefined|null} value - The value to get first character from
   * @returns {string} - First character or empty string
   */
  charAt: (value, index = 0) => {
    if (value == null) return '';
    return String(value).charAt(index);
  },

  /**
   * Safely get first character (uppercase)
   * @param {string|undefined|null} value - The value to get first character from
   * @returns {string} - First character uppercase or empty string
   */
  firstChar: (value) => {
    return safeString.charAt(value).toUpperCase();
  },

  /**
   * Safely get initials from name
   * @param {string|undefined|null} firstName - First name
   * @param {string|undefined|null} lastName - Last name
   * @returns {string} - Initials or empty string
   */
  getInitials: (firstName, lastName) => {
    const first = safeString.firstChar(firstName);
    const last = safeString.firstChar(lastName);
    return first + last;
  },

  /**
   * Safely get substring
   * @param {string|undefined|null} value - The value to get substring from
   * @param {number} start - Start index
   * @param {number} end - End index
   * @returns {string} - Substring or empty string
   */
  substring: (value, start, end) => {
    if (value == null) return '';
    return String(value).substring(start, end);
  },

  /**
   * Safely get length
   * @param {string|undefined|null} value - The value to get length from
   * @returns {number} - Length or 0
   */
  length: (value) => {
    if (value == null) return 0;
    return String(value).length;
  },

  /**
   * Safely check if string includes substring
   * @param {string|undefined|null} value - The value to check
   * @param {string} searchString - The string to search for
   * @returns {boolean} - True if includes, false otherwise
   */
  includes: (value, searchString) => {
    if (value == null) return false;
    return String(value).includes(searchString);
  },

  /**
   * Safely trim string
   * @param {string|undefined|null} value - The value to trim
   * @returns {string} - Trimmed string or empty string
   */
  trim: (value) => {
    if (value == null) return '';
    return String(value).trim();
  }
};

export default safeString;

