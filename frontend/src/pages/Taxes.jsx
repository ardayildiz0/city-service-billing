import CrudPage from "../components/CrudPage";

export default function Taxes() {
  return (
    <CrudPage
      title="Vergiler"
      endpoint="/taxes"
      fields={[
        { key: "name", label: "Vergi Adi" },
        { key: "rate", label: "Oran (%)", type: "number" },
      ]}
    />
  );
}
