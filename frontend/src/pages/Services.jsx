import CrudPage from "../components/CrudPage";

export default function Services() {
  return (
    <CrudPage
      title="Hizmetler"
      endpoint="/services"
      fields={[{ key: "name", label: "Hizmet Adi" }]}
    />
  );
}
