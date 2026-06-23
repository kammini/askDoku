export default function Ask() {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        const formdata = new FormData(event.currentTarget);
        fetch("#",{
            method: "POST",
            body: formdata
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="text" placeholder="What is this document about?" />
            <button type="submit">Enter</button>
        </form>
    )
}