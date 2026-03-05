import CrudPage from "../components/CrudPage";

export default function Currencies() {
  return (
    <CrudPage
      title="Para Birimleri"
      endpoint="/currencies"
      fields={[
        { key: "name", label: "Adi" },
        { key: "code", label: "Kod (USD, EUR...)" },
      ]}
    />
  );
}
