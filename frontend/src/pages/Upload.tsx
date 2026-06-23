export default function Upload() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formdata = new FormData(event.currentTarget);
    const file = formdata.get("file") as File;
    if (file instanceof File) {
      const body = new FormData();
      body.append("file", file);
      fetch("http://localhost:8000/upload", {
        method: "POST",
        body,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  )
}
