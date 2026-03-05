import CrudPage from "../components/CrudPage";

export default function Cities() {
  return (
    <CrudPage
      title="Sehirler"
      endpoint="/cities"
      fields={[{ key: "name", label: "Sehir Adi" }]}
    />
  );
}
