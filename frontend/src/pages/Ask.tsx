import { useState } from "react";

export default function Ask() {
    const [answer, setAnswer] = useState();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formdata = new FormData(event.currentTarget);
        const question = formdata.get("text") as string;
        const res = await fetch(`http://localhost:8000/ask?question=${encodeURIComponent(question)}`, {
            method: "POST",
        });
        const data = await res.json();
        setAnswer(data.answer);
    }

    return (
        <div className="h-screen flex flex-col gap-8 items-center justify-center">
            <form onSubmit={handleSubmit} className="flex gap-6 w-2/3">
                <input type="text" name="text" placeholder="What is this document about?" className="w-full h-10 border rounded-full text-center"/>
                <button type="submit" className="bg-red-500 w-1/5 text-white rounded-full cursor-pointer">Enter</button>
            </form>
            {answer && <p className="w-2/3 text-center italic">{answer}</p>}
        </div>

    )
}