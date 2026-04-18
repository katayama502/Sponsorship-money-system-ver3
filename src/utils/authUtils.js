export const generateCredentials = (_name = '') => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const gen = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return {
    student: { id: gen(6), pw: gen(8) },
    parent:  { id: gen(6), pw: gen(8) },
  };
};
