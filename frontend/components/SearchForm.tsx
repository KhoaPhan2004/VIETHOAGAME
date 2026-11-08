import Button from "@/components/Button";

export default function SearchForm() {
  return (
    <form className="search-form" action="/games">
      <input
        type="text"
        name="q"
        placeholder="Tìm tên game, thể loại, bản dịch..."
      />

      <Button type="submit">
        Tìm kiếm
      </Button>
    </form>
  );
}
