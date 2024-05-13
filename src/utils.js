/**
 * Formats a numeric value into Dominican Peso (DOP) currency format.
 *
 * @param {number} value - The numeric value to be formatted.
 * @returns {string} The formatted value in DOP currency.
 *
 * @example
 * const formattedValue = formatToDOP(1500);
 * console.log(formattedValue); // Expected output: "RD$ 1,500.00"
 */
const formatToDOP = (value) => {
    const numberValue = parseFloat(value);
    const moneyValue = numberValue.toLocaleString('es-DO', {
        style: 'currency',
        currency: 'DOP'
    });

    return moneyValue;
}

/**
 * Adds two numeric values and returns the result.
 *
 * @param {number} firstValue - The first numeric value to be added.
 * @param {number} secondValue - The second numeric value to be added.
 * @returns {number} The sum of the two values.
 *
 * @example
 * const result = sumTwoValues(10, 5);
 * console.log(result); // Expected output: 15
 */
const sumTwoValues = (firstValue, secondValue) => {
    const first = parseFloat(firstValue);
    const second = parseFloat(secondValue);

    const result = first + second;
    return result;
}

/**
 * Subtracts the second numeric value from the first and returns the result.
 *
 * @param {number} firstValue - The first numeric value (minuend).
 * @param {number} secondValue - The second numeric value (subtrahend).
 * @returns {number} The result of subtracting the second value from the first.
 *
 * @example
 * const result = subtractTwoValues(10, 5);
 * console.log(result); // Expected output: 5
 */
const subtractTwoValues = (firstValue, secondValue) => {
    const first = parseFloat(firstValue);
    const second = parseFloat(secondValue);

    const result = first - second;
    return result;
}

module.exports = {
    formatToDOP,
    sumTwoValues,
    subtractTwoValues
}
