import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";

// @ts-ignore
export default function Editor(props) {
  const { onChange=()=>{}, getEditor=()=>{}, initialContent } = props;
  const editor = useCreateBlockNote({
    initialContent: initialContent
  });

  getEditor(editor);

  const _onChange = () => {
    onChange(editor.document);
  }

  return <BlockNoteView editor={editor} onChange={_onChange} />;
}
