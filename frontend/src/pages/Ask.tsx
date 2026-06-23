export default function Ask() {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formdata = new FormData(event.currentTarget);
        const question = formdata.get("text") as string;
        fetch(`http://localhost:8000/ask?question=${encodeURIComponent(question)}`, {
            method: "POST",
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="text" placeholder="What is this document about?" />
            <button type="submit">Enter</button>
        </form>
    )
}