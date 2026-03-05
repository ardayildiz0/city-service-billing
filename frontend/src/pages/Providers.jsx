import CrudPage from "../components/CrudPage";

export default function Providers() {
  return (
    <CrudPage
      title="Saglayicilar"
      endpoint="/providers"
      fields={[{ key: "name", label: "Saglayici Adi" }]}
    />
  );
}
