import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { io } from "socket.io-client";
import api from "../../utils/api";

const socket = io("http://localhost:4000");

function TextEditor() {
    const { documentId } = useParams();
    const [title, setTitle] = useState("Untitled Document");
    const [initialContent, setInitialContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [cursors, setCursors] = useState({}); // Track other users' cursors

    useEffect(() => {
        if (!documentId) return;

        const fetchDocument = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/api/documents/${documentId}`);
                const document = response.data;
                
                if (document) {
                    setTitle(document.title || "Untitled Document");
                    setInitialContent(document.content || "");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [documentId]);

    useEffect(() => {
        if (!documentId) return;

        socket.emit("join-document", { documentId });

        socket.on("load-document", (content) => {
            if (editor) {
                editor.commands.setContent(content);
            }
        });

        socket.on("receive-changes", (content) => {
            if (editor && content !== editor.getHTML()) {
                editor.commands.setContent(content);
            }
        });

        socket.on("cursor-update", ({ userId, cursor }) => {
            setCursors((prev) => ({
                ...prev,
                [userId]: cursor,
            }));
        });

        return () => {
            socket.off("receive-changes");
            socket.off("cursor-update");
        };
    }, [documentId]);

    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent,
        autofocus: true,
        onUpdate: ({ editor }) => {
            const content = editor.getHTML();
            socket.emit("send-changes", { documentId, content });
        },
    });

    useEffect(() => {
        if (editor && initialContent) {
            editor.commands.setContent(initialContent);
        }
    }, [editor, initialContent]);

    const saveDocument = useCallback(() => {
        const content = editor?.getHTML() || "";
        socket.emit("save-document", { documentId, content });
    }, [documentId, editor]);

    // Handle Cursor Movement
    const handleCursorMove = (event) => {
        const cursor = { x: event.clientX, y: event.clientY };
        socket.emit("cursor-move", { documentId, cursor });
    };

    return (
        <div className="min-h-screen bg-white" onMouseMove={handleCursorMove}>
            <div className="max-w-[90%] mx-auto p-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-3xl font-bold p-2 border-none outline-none bg-transparent"
                    placeholder="Untitled Document"
                />

                <div className="border rounded-lg overflow-hidden bg-white min-h-[calc(100vh-200px)] p-4 relative">
                    <EditorContent editor={editor} />
                    
                    {/* Render cursors for other users */}
                    {Object.entries(cursors).map(([userId, cursor]) => (
                        <div
                            key={userId}
                            style={{
                                position: "absolute",
                                left: cursor.x,
                                top: cursor.y,
                                width: "8px",
                                height: "8px",
                                backgroundColor: "red",
                                borderRadius: "50%",
                                pointerEvents: "none",
                            }}
                        ></div>
                    ))}
                </div>

                <button
                    onClick={saveDocument}
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                >
                    Save
                </button>
            </div>
        </div>
    );
}

export default TextEditor;
