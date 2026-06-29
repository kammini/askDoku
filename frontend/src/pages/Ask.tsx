import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"
import Markdown from "react-markdown";

type Source = {
    filename: string
    page_number: number
    section_title: string | null
    content: string
    similarity: number
}

type Message = {
    role: "user" | "assistant"
    content: string
    sources: Source[]
    showSources: boolean
}

export default function Ask() {
    const [loading, setLoading] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setSessionId(crypto.randomUUID());
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const formdata = new FormData(event.currentTarget);
        const question = formdata.get("text") as string;
        setInputValue("");
        setMessages(prev => [...prev,
            { role: "user", content: question, sources: [], showSources: false },
            { role: "assistant", content: "", sources: [], showSources: false }
        ])
        const res = await fetch(`http://localhost:8000/ask`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, question })
        });
        const utf8decoder = new TextDecoder();
        const reader = res.body?.getReader();
        if (!reader) { setLoading(false); return; }
        while (true) {
            const { done, value } = await reader?.read();
            if (done) break;
            const decodedValue = utf8decoder.decode(value);
            for (const line of decodedValue.split("\n\n")) {
                if (!line) continue;
                const response = line.slice(6);
                if (response === "DONE") break;
                if (response.startsWith("{")) {
                    setMessages(prev => {
                        const updated = [...prev];
                        const last = { ...updated[updated.length - 1] };
                        last.sources = [...last.sources, JSON.parse(response)];
                        updated[updated.length - 1] = last;
                        return updated;
                    })
                } else {
                    setMessages(prev => {
                        const updated = [...prev];
                        const last = { ...updated[updated.length - 1] };
                        last.content += response.replaceAll("\\n", "\n");
                        updated[updated.length - 1] = last;
                        return updated;
                    })
                }
            }
        }
        setLoading(false);
    }

    function newConvo() {
        setMessages([]);
        setSessionId(crypto.randomUUID());
    }

    function toggleShowSources(index: number) {
        setMessages(prev => {
            const updated = [...prev];
            const msg = { ...updated[index] };
            msg.showSources = !msg.showSources;
            updated[index] = msg;
            return updated;
        })
    }

    const isEmpty = messages.length === 0;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <Link to="/" className="font-semibold text-gray-800 text-sm tracking-tight">askDoku</Link>
                </div>
                {!isEmpty && (
                    <button
                        onClick={newConvo}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New chat
                    </button>
                )}
            </header>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">Ask anything about your docs</h2>
                        <p className="text-sm text-gray-400 max-w-xs">Type a question below and get answers grounded in your documents.</p>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                    msg.role === "user"
                                        ? "bg-red-500 text-white rounded-br-sm"
                                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                                }`}>
                                    {msg.role === "assistant" && !msg.content && loading ? (
                                        <span className="flex gap-1 items-center h-5">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                        </span>
                                    ) : (
                                        <Markdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                                code: ({ children }) => <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                                pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-xs my-2">{children}</pre>,
                                            }}
                                        >
                                            {msg.content}
                                        </Markdown>
                                    )}
                                </div>

                                {msg.role === "assistant" && msg.sources.length > 0 && (
                                    <div className="w-full max-w-[85%]">
                                        <button
                                            onClick={() => toggleShowSources(i)}
                                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mb-2"
                                        >
                                            <svg className={`w-3.5 h-3.5 transition-transform ${msg.showSources ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            {msg.showSources ? "Hide" : "Show"} {msg.sources.length} source{msg.sources.length !== 1 ? "s" : ""}
                                        </button>

                                        {msg.showSources && (
                                            <div className="flex flex-col gap-2">
                                                {msg.sources.map((source, j) => (
                                                    <div key={j} className="rounded-xl p-3 bg-red-50 border border-red-100">
                                                        <p className="line-clamp-3 text-xs text-gray-600 leading-relaxed mb-2">{source.content}</p>
                                                        <div className="flex items-center justify-between pt-2 border-t border-red-100">
                                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                                <span className="text-xs font-medium text-gray-700 truncate">{source.filename}</span>
                                                                {source.section_title && (
                                                                    <span className="text-xs text-gray-400 truncate">{source.section_title}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0 ml-3">
                                                                <span>p.{source.page_number}</span>
                                                                <span className="font-medium text-red-400">{(source.similarity * 100).toFixed(0)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-4 py-4">
                <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2 items-center">
                    <input
                        type="text"
                        name="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Ask a question about your documents…"
                        disabled={loading}
                        className="flex-1 h-11 border border-gray-200 rounded-full px-5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-300 transition disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !inputValue.trim()}
                        className="w-11 h-11 flex items-center justify-center bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-full shadow-sm shrink-0"
                    >
                        {loading ? (
                            <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
