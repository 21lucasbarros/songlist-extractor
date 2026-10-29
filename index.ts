import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { PdfReader } from "pdfreader";

interface Entry {
  interprete: string;
  codigo: string;
  titulo: string;
  letra: string;
  idioma: string;
}

const FIELDS = ["interprete", "codigo", "titulo", "letra", "idioma"] as const satisfies readonly (keyof Entry)[];

if (process.argv.length !== 3) {
  console.error("Uso Inválido. Utilize: node index.ts <CAMINHO DO ARQUIVO>");
  process.exit(1);
}

const inputPath = process.argv[2]!;
const outputPath = path.join(process.cwd(), "lista_musicas.json");

const IGNORE = new Set<string>([
  "APARELHO", "AUDIOVISUAL", "DE KARAOKE", "LISTA DE MUSICAS DO", "J6L5E22J",
  "Ordem alfabetica", "por interprete,", "codigo", "Interprete", "Cod",
  "Titulo", "Inicio da letra", "Idioma", "Total de musicas listadas", "13199",
]);

let count = 0;
let item: Partial<Entry> = {};
const items: Entry[] = [];

const reader = new PdfReader();
console.log(`Lendo e processando: ${inputPath}...`);

reader.parseFileItems(inputPath, (error, data) => {
  if (error) {
    console.error("Erro ao processar o PDF:", error);
    return;
  }

  if (!data) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), "utf-8");
      console.log(`\nSucesso! Arquivo gerado em: ${outputPath}`);
      console.log(`Total de músicas extraídas: ${items.length}`);
    } catch (err) {
      console.error("Erro ao escrever o arquivo JSON:", err);
    }
    return;
  }

  if (!("text" in data) || !data.text?.length) return;

  const text = data.text.trim();
  if (text === "" || IGNORE.has(text)) return;

  const step = count % FIELDS.length;
  item[FIELDS[step]!] = text;

  if (step === FIELDS.length - 1) {
    items.push(item as Entry);
    item = {};
  }

  count += 1;
});
