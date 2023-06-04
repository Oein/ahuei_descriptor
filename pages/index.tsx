/* eslint-disable @next/next/no-img-element */
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import styles from "@/styles/Home.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import translate from "@/auhui";

type Monaco = typeof monaco;

export default function Home() {
  const leftEditor = useRef<editor.IStandaloneCodeEditor>();
  const rightEditor = useRef<editor.IStandaloneCodeEditor>();

  const [auhei, setAUHEI] = useState("방방다망함");
  const [translated, setTRS] = useState(
    "사용자로 부터 숫자를 입력받아서 '아'에 저장해요.\n사용자로 부터 숫자를 입력받아서 '아'에 저장해요.\n'아'에 있는 두 수의 합을 구해요.\n'아'에서 숫자를 꺼내 출력해요.\n프로그램을 종료해요."
  );

  const handleEditorDidMount = useCallback(
    (_valueGetter: editor.IStandaloneCodeEditor, editor: Monaco) => {
      leftEditor.current = _valueGetter;
    },
    []
  );

  const handleEditorDidMount2 = useCallback(
    (_valueGetter: editor.IStandaloneCodeEditor, editor: Monaco) => {
      rightEditor.current = _valueGetter;
    },
    []
  );

  const resizeHandler = () => {
    console.log("Hi");
    leftEditor.current?.layout({
      height: window.innerHeight,
      width: window.innerWidth / 2,
    });
    rightEditor.current?.layout({
      height: window.innerHeight,
      width: window.innerWidth / 2,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  });

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <Editor
          height="calc(100vh)"
          defaultLanguage="ahuei"
          defaultValue="방방다망함"
          onMount={handleEditorDidMount}
          theme="vs-dark"
          value={auhei}
          onChange={(s) => {
            setAUHEI(s || "");
          }}
        />
        <Editor
          height="calc(100vh)"
          defaultLanguage="ahuei"
          defaultValue="방방다망함"
          onMount={handleEditorDidMount2}
          theme="vs-dark"
          value={translated}
          options={{
            readOnly: true,
          }}
        />
      </div>
      <button
        className={styles.button}
        onClick={() => {
          setTRS(translate(auhei));
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="48"
          viewBox="0 -960 960 960"
          width="48"
          className={styles.icon}
        >
          <path
            fill="white"
            d="m475-80 181-480h82L924-80h-87l-41-126H604L557-80h-82Zm151-196h142l-70-194h-2l-70 194Zm-466 76-55-55 204-204q-38-44-67.5-88.5T190-640h87q17 33 37.5 62.5T361-517q45-47 75-97.5T487-720H40v-80h280v-80h80v80h280v80H567q-22 69-58.5 135.5T419-458l98 99-30 81-127-122-200 200Z"
          />
        </svg>
      </button>
    </div>
  );
}
