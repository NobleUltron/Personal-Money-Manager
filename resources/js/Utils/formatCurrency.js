/**
 * Utility helper to format money amounts with user's preferred currency symbol.
 * Example: formatCurrency(25000, 'UGX') => "UGX 25,000.00"
 * Example: formatCurrency(1250, '$') => "$1,250.00"
 */
export function formatMoney(amount = 0, symbol = 'UGX', decimals = 2) {
    const num = Number(amount) || 0;
    const formattedNum = num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    const isCodeSymbol = symbol && (symbol.length > 1 || symbol === 'UGX' || symbol === 'KSh');

    if (isCodeSymbol) {
        return `${symbol} ${formattedNum}`;
    }

    return `${symbol}${formattedNum}`;
}

export default formatMoney;
