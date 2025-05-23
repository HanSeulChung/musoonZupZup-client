export const formatDate = (str) => new Date(str).toLocaleDateString();

export const formatPriceToKorean = (price) => {
  if (!price && price !== 0) return '-';
  const amount = price * 10000;
  const 억 = Math.floor(amount / 100000000);
  const 만 = Math.floor((amount % 100000000) / 10000);
  let result = '';
  if (억 > 0) result += `${억}억`;
  if (만 > 0) result += ` ${만}만원`;
  return result.trim();
};