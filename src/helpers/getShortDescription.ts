const getShortDescription = (description: string): string => {
  const index = description.indexOf(" /");
  return index !== -1 ? description.substring(0, index) : description;
};

export default getShortDescription;
