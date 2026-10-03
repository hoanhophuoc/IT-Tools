"use client";
import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import Button from "@/components/ui/Button";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
  "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
  "est", "laborum"
];

function getRandomWord() {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateLoremIpsum({
  paragraphs,
  sentencesPerParagraph,
  wordsPerSentence,
  startWithLorem,
  asHtml
}) {
  let result = [];
  for (let p = 0; p < paragraphs; p++) {
    let paragraph = [];
    for (let s = 0; s < sentencesPerParagraph; s++) {
      let sentence = [];
      for (let w = 0; w < wordsPerSentence; w++) {
        sentence.push(getRandomWord());
      }
      let sentenceStr = capitalize(sentence.join(" ")) + ".";
      paragraph.push(sentenceStr);
    }
    let paraStr = paragraph.join(" ");
    if (p === 0 && startWithLorem) {
      paraStr = "Lorem ipsum dolor sit amet. " + paraStr;
    }
    if (asHtml) {
      paraStr = `<p>${paraStr}</p>`;
    }
    result.push(paraStr);
  }
  return asHtml ? result.join("\n") : result.join("\n\n");
}

export default function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences, setSentences] = useState(4);
  const [words, setWords] = useState(8);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [asHtml, setAsHtml] = useState(false);
  const [output, setOutput] = useState("");

  const generate = () => {
    setOutput(
      generateLoremIpsum({
        paragraphs,
        sentencesPerParagraph: sentences,
        wordsPerSentence: words,
        startWithLorem,
        asHtml
      })
    );
  };


  useEffect(() => {
    generate();

  }, [paragraphs, sentences, words, startWithLorem, asHtml]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Paragraphs: {paragraphs}</label>
          <Input
            type="range"
            min={1}
            max={50}
            value={paragraphs}
            onChange={e => setParagraphs(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sentences per paragraph: {sentences}</label>
          <Input
            type="range"
            min={1}
            max={50}
            value={sentences}
            onChange={e => setSentences(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Words per sentence: {words}</label>
          <Input
            type="range"
            min={1}
            max={50}
            value={words}
            onChange={e => setWords(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-4 mt-6">
          <Button
            type="button"
            onClick={() => setStartWithLorem(v => !v)}
            className={startWithLorem ? "bg-blue-600 text-white" : ""}
          >
            {startWithLorem ? "Starts with Lorem Ipsum" : "No Lorem Start"}
          </Button>
          <Button
            type="button"
            onClick={() => setAsHtml(v => !v)}
            className={asHtml ? "bg-blue-600 text-white" : ""}
          >
            {asHtml ? "As HTML" : "As Text"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <TextArea
          label="Output"
          value={output}
          readOnly
          rows={10}
        />
        <div className="  flex gap-2">
          <CopyToClipboardButton textToCopy={output} buttonText="Copy" />
          <Button type="button" onClick={generate}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}