import KSUID from "ksuid";

export const generateId = () => {
  return KSUID.randomSync();
};
export const getId = (string) => {
  return string.split("#")[1];
};
export const idToDate = (string) => {
  return KSUID.parse(getId(string)).date;
};
export const idToOrder = (string) => {
  return parseInt(getId(string));
};
