import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { PdfReader } from "pdfreader";

if (process.argv.length !== 3) {
  console.error("Uso Inválido. Utilize: node index.js <CAMINHO DO ARQUIVO>");
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = path.join(process.cwd(), "lista_musicas.json");

const IGNORE = new Set([
  "APARELHO",
  "AUDIOVISUAL",
  "DE KARAOKE",
  "LISTA DE MUSICAS DO",
  "J6L5E22J",
  "Ordem alfabetica",
  "por interprete,",
  "codigo",
  "Interprete",
  "Cod",
  "Titulo",
  "Inicio da letra",
  "Idioma",
  "Total de musicas listadas",
  "13199",
]);

/**
 * @typedef Entry
 * @prop {string} interprete
 * @prop {string} codigo
 * @prop {string} titulo
 * @prop {string} letra
 * @prop {string} idioma
 * */

let count = 0;
/** @type {Partial<Entry>} */
let item = {};
/** @type {Entry[]} */
const items = [];

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

  if (!data.text?.length) return;

  const text = data.text.trim();
  if (text === "" || IGNORE.has(text)) return;

  const step = count % 5;
  switch (step) {
    case 0:
      item.interprete = text;
      break;
    case 1:
      item.codigo = text;
      break;
    case 2:
      item.titulo = text;
      break;
    case 3:
      item.letra = text;
      break;
    case 4:
      item.idioma = text;
      items.push({ ...item });
      item = {}; // reseta para a próxima iteração
      break;
  }

  count += 1;
});
