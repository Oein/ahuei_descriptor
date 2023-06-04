import { assemble, disassemble } from "hangul-js";

interface Pos {
  x: number;
  y: number;
}

interface Code {
  code?: string[];
  id: Pos;
}

const INDENT_SIZE = 4;
const SYSTEM_PAD = 6;
const PRINT_CURSOR = false;
const PRINT_MEMORY_TYPE = false;
const PRINT_NAME = false;

const chosung = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];
const jungsung = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
];
const jongsung = [
  " ",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];
const korean2num: { [key: string]: number } = {
  " ": 0,
  ㄱ: 2,
  ㄴ: 2,
  ㅈ: 3,
  ㄷ: 3,
  ㅅ: 3,
  ㅋ: 3,
  ㅂ: 4,
  ㅁ: 4,
  ㅌ: 4,
  ㅊ: 4,
  ㅍ: 4,
  ㄲ: 4,
  ㅆ: 4,
  ㄳ: 4,
  ㄹ: 5,
  ㄵ: 5,
  ㄶ: 5,
  ㅄ: 6,
  ㄺ: 7,
  ㄽ: 7,
  ㅀ: 8,
  ㄻ: 9,
  ㄼ: 9,
  ㄿ: 9,
  ㄾ: 9,
};
const num2koreanPronounce: { [key: number]: string } = {
  0: "영",
  1: "일",
  2: "이",
  3: "삼",
  4: "사",
  5: "오",
  6: "육",
  7: "칠",
  8: "팔",
  9: "구",
};

export default function translate(str: string) {
  let cursor: Pos = {
    x: 0,
    y: 0,
  };
  let descripted: string[] = [];

  const CONTENT = str.split("\n").map((line, index) =>
    line.split("").map((char, inde2) => {
      let hg = splitHangul(char);
      return {
        code: hg.length == 0 ? null : hg,
        id: {
          x: inde2,
          y: index,
        },
      } as Code;
    })
  );

  function indent(len: number) {
    len *= INDENT_SIZE;
    let out = "";
    while (out.length < len) out += " ";
    return out;
  }

  function splitHangul(code: string): string[] {
    let c = code.charCodeAt(0);
    if (c < 0xac00 || c > 0xd7a3) return [];
    c -= 0xac00;
    return [
      chosung[Math.floor(c / 28 / 21)],
      jungsung[Math.floor(c / 28) % 21],
      jongsung[c % 28],
    ];
  }

  function canRUN({ x, y }: Pos) {
    return (
      x >= 0 &&
      y >= 0 &&
      y < CONTENT.length &&
      x < CONTENT[y].length &&
      CONTENT[y][x] != null
    );
  }

  function nativeBEchar(korean: string) {
    const kr = korean.charAt(korean.length - 1);
    const spli = splitHangul(kr);

    if (spli.length == 0) throw new Error("Not a korean");
    if (spli[2] == " ") return "를";
    else return "을";
  }

  function nativeASchar(korean: string) {
    const kr = korean[0];
    const spli = disassemble(kr);

    if (spli.length == 0) throw new Error("Not a korean");
    if (spli.length == 2) return "로";
    else return "으로";
  }

  function padEnd(str: string, len: number = 8) {
    while (str.length < len) str = str + " ";
    return str;
  }

  let callStackCount = 0;
  let visited: Pos[] = [];
  let selectedMemoryType = "아";

  if (PRINT_MEMORY_TYPE) selectedMemoryType += "(스택)";

  function run() {
    while (true) {
      if (!canRUN(cursor)) break;

      let code = CONTENT[cursor.y][cursor.x];
      if (!code.code) break;

      let desc: string[] = [];
      let cursurMessage: string;
      let ifstated = false;

      const descripter = (message: string) => {
        desc.push(message);
      };
      const cursourdescripter = (message: string) => {
        cursurMessage = message;
      };
      const returnMessage = (systemMessage = false) => {
        let apps: string[] = [];
        let ind = indent(callStackCount);
        if (ind.length > 1) {
          ind = ind.substring(0, ind.length - 1);
        }
        if (ind.length) apps.push(ind);
        return [
          ...(PRINT_NAME
            ? [
                !systemMessage
                  ? padEnd(assemble(code.code!))
                  : padEnd("시스템", SYSTEM_PAD),
                "/",
              ]
            : []),
          ...apps,
          ...desc,
          ...(ifstated ? [] : [cursurMessage]),
        ].join(" ");
      };
      const handlerCursour = (ifstated_: boolean = false, inverted = false) => {
        let ender = "이동해요.";
        if (ifstated_) ender = "이동해서, ";

        ifstated = ifstated_;

        // 상, 하, 좌, 우
        const handleDir = (times: number, dir: number) => {
          if (inverted) {
            if (dir == 4) dir = 3;
            else if (dir == 3) dir = 4;
            else if (dir == 2) dir = 1;
            else if (dir == 1) dir = 2;
          }

          let midmessage = "";
          let dirMessage = "";
          if (times > 1) midmessage = `${times}번 `;

          if (dir == 4) {
            dirMessage = "오른쪽으로";
            cursor.x += times;
          } else if (dir == 3) {
            dirMessage = "왼쪽으로";
            cursor.x -= times;
          } else if (dir == 2) {
            dirMessage = "아래로";
            cursor.y += times;
          } else if (dir == 1) {
            dirMessage = "위로";
            cursor.y -= times;
          }

          if (ifstated_ || PRINT_CURSOR)
            cursourdescripter(`커서를 ${dirMessage} ${midmessage}${ender}`);
        };

        // Handle CURSOR
        switch (code.code![1]) {
          case "ㅏ":
            handleDir(1, 4);
            break;
          case "ㅓ":
            handleDir(1, 3);
            break;
          case "ㅗ":
            handleDir(1, 1);
            break;
          case "ㅜ":
            handleDir(1, 2);
            break;

          case "ㅑ":
            handleDir(2, 4);
            break;
          case "ㅕ":
            handleDir(2, 3);
            break;
          case "ㅛ":
            handleDir(2, 1);
            break;
          case "ㅠ":
            handleDir(2, 2);
            break;
        }
      };
      const handleNUM = () => {
        let korean = code!.code![2];
        let num = 0;

        if (korean in korean2num) {
          num = korean2num[korean];
        }

        descripter(
          `${num}${nativeBEchar(
            num2koreanPronounce[num]
          )} '${selectedMemoryType}'에 추가해요.`
        );
      };
      const callstackedRun = () => {
        callStackCount++;
        run();
        callStackCount--;
      };
      const ifmessager = (msg: string) => {
        desc = [];
        descripter(msg);
        descripted.push(returnMessage());
        desc = [];
      };
      const ifcloser = () => {
        ifmessager("}");
      };

      if (visited.some((x) => x.x == cursor.x && x.y == cursor.y)) {
        descripter(" [!] 코드가 반복되었어요.");
        descripted.push(returnMessage(true));
        return;
      } else visited.push(Object.assign({}, cursor));

      // Handle command
      switch (code.code[0]) {
        // 사칙연산
        case "ㄷ":
          descripter(`'${selectedMemoryType}'에 있는 두 수의 합을 구해요.`);
          break;
        case "ㅌ":
          descripter(`'${selectedMemoryType}'에 있는 두 수의 차를 구해요.`);
          break;
        case "ㄸ":
          descripter(`'${selectedMemoryType}'에 있는 두 수의 곱을 구해요.`);
          break;
        case "ㄴ":
          descripter(
            `'${selectedMemoryType}'에 있는 두 수를 나눈 값을 구해요.`
          );
          break;
        case "ㄹ":
          descripter(
            `'${selectedMemoryType}에 있는 두 수를 나누었을때의 나머지를 구해요.`
          );
          break;

        // 변수 쓰기
        case "ㅂ":
          if (code.code[2] === "ㅇ")
            descripter(
              `사용자로 부터 숫자를 입력받아서 '${selectedMemoryType}'에 저장해요.`
            );
          else if (code.code[2] === "ㅎ")
            descripter(
              `사용자로 부터 글자를 입력받아서 아스키 코드로 '${selectedMemoryType}'에 저장해요.`
            );
          else handleNUM();
          break;
        case "ㅃ":
          descripter(
            `'${selectedMemoryType}'에 가장 마지막으로 넣은 숫자를 한번 더 넣어요.`
          );
          break;

        // SWAP
        case "ㅍ":
          descripter(
            `'${selectedMemoryType}'에 들어있는 첫번째 숫자와 가장 마지막 숫자를 더해요.`
          );
          break;

        // IF
        case "ㅈ":
          descripter(
            `'${selectedMemoryType}' 에서 두개의 수를 꺼내서, 나중에 나온 숫자가 처음 숫자보다 크면 1을, 아니면 0을 저장해요.`
          );
          break;
        case "ㅊ":
          let oldCursour = Object.assign({}, cursor);
          let oldVisited = [...visited];
          let oldMemoryType = selectedMemoryType + "";

          handlerCursour(true, true);

          ifmessager(
            `'${selectedMemoryType}' 에서 가져온 수가 0이라면, ${
              PRINT_CURSOR ? cursurMessage! : ""
            }아래의 구문을 실행해요. {`
          );
          callstackedRun();
          ifcloser();

          // CURSOUR ROLLBACK
          cursor = oldCursour;
          visited = oldVisited;
          selectedMemoryType = oldMemoryType;

          // INVERTED

          handlerCursour(true);
          ifmessager(
            `그렇지 않다면, ${
              PRINT_CURSOR ? cursurMessage! : ""
            }아래의 구문을 실행해요. {`
          );
          callstackedRun();
          ifcloser();

          return;

        // OUTPUT
        case "ㅁ":
          if (code.code[2] === "ㅇ")
            descripter(`'${selectedMemoryType}'에서 숫자를 꺼내 출력해요.`);
          if (code.code[2] === "ㅎ")
            descripter(
              `'${selectedMemoryType}'에서 숫자를 꺼내 아스키 코드로 읽어서 출력해요.`
            );
          break;

        // MEMORY
        case "ㅅ":
          let memoryName = assemble([
            "ㅇ",
            "ㅏ",
            ...(code.code![2] != " " ? [code.code![2]] : []),
          ]);

          let memoryType = "스택";
          if (code.code![2] == "ㅇ") memoryType = "큐";

          selectedMemoryType = memoryName;

          if (!PRINT_MEMORY_TYPE) memoryType = "";
          else {
            memoryType = `(${memoryType})`;
            selectedMemoryType += memoryType;
          }

          descripter(
            `사용할 저장공간을 ${memoryName}${memoryType}${nativeASchar(
              memoryName
            )} 변경해요.`
          );
          break;
        case "ㅆ":
          let memoryName_ = assemble(["ㅇ", "ㅏ", code.code![2]]);
          let memoryType_ = "스택";
          if (code.code![2] == "ㅇ") memoryType_ = "큐";
          if (!PRINT_MEMORY_TYPE) memoryType_ = ``;
          else memoryType_ += " ";
          descripter(
            `${selectedMemoryType}에 있는 값을 ${memoryType_}${memoryName_}${nativeASchar(
              memoryName_
            )} 이동해요.`
          );
          break;

        // EXIT
        case "ㅎ":
          descripter("프로그램을 종료해요.");
          descripted.push(returnMessage());
          return;
        default:
          descripter("아무것도 하지 않아요.");
          break;
      }

      handlerCursour();

      descripted.push(returnMessage());
    }
  }

  run();

  return descripted.join("\n");
}
