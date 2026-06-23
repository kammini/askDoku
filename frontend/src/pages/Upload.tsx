export default function Upload() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formdata = new FormData(event.currentTarget);
    const file = formdata.get("file") as File;
    if (file instanceof File) {
      fetch("#", {
        method: "POST",
        body: file
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