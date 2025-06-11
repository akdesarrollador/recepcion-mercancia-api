function formatLocation(location: string): string {
  if (location === "AKOP") return "Galpón";

  const map: { [key: string]: string } = {
    AK: "Alkosto",
    FC: "Familia Center",
    HC: "Hogar Center",
  };

  const prefix = location.slice(0, 2);
  const suffix = location.slice(2);

  if (map[prefix] && suffix) {
    return `${map[prefix]} ${suffix}`;
  }

  return location;
}

export default formatLocation;
