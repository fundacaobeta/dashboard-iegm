import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';
import { Buffer } from 'buffer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datasetPath = path.join(__dirname, '../dataset');
const backupPath = path.join(__dirname, '../dataset-backup');

/**
 * Heurística para detectar o encoding de um buffer.
 * Favorece windows-1252 para conteúdo em português que não é UTF-8.
 * @param buffer O buffer do arquivo.
 * @returns O encoding detectado como string.
 */
function detectEncoding(buffer: Buffer): string {
  // 1. Verificação definitiva por BOM (Byte Order Mark)
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return 'utf8';
  }
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return 'utf16le';
  }
  if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
    return 'utf16be';
  }

  // 2. Tenta decodificar como UTF-8. Se não houver caracteres de substituição (),
  // é um UTF-8 válido (sem BOM).
  const utf8String = iconv.decode(buffer, 'utf8');
  if (!utf8String.includes('\uFFFD')) {
     return 'utf8';
  }

  // 3. Se não for UTF-8, para conteúdo em português, a próxima suspeita
  // é 'windows-1252', que é um superconjunto do 'latin1' (ISO-8859-1).
  return 'windows-1252';
}

/**
 * Converte um arquivo para UTF-8, criando um backup antes.
 * @param filePath O caminho completo do arquivo a ser convertido.
 */
function convertFileToUtf8(filePath: string): void {
  try {
    const buffer = fs.readFileSync(filePath);

    // Se o arquivo estiver vazio, não há nada a fazer.
    if (buffer.length === 0) {
        console.log(`- Arquivo vazio, pulando: ${filePath}`);
        return;
    }

    const originalEncoding = detectEncoding(buffer);

    if (originalEncoding === 'utf8') {
      console.log(`✓ Arquivo já está em UTF-8: ${path.basename(filePath)}`);
      // Opcional: Se quiser garantir que não há BOM, pode descomentar abaixo
      // const content = buffer.toString('utf8');
      // if (content.charCodeAt(0) === 0xFEFF) {
      //   fs.writeFileSync(filePath, content.slice(1), 'utf8');
      //   console.log(`  ↳ BOM removido de ${path.basename(filePath)}`);
      // }
      return;
    }

    console.log(`Convertendo: ${path.basename(filePath)} (detectado: ${originalEncoding})`);

    // Decodifica o buffer usando o encoding detectado.
    // iconv-lite cuidará dos caracteres especiais automaticamente.
    const content = iconv.decode(buffer, originalEncoding);

    // Salva o conteúdo de volta no mesmo arquivo, agora codificado em UTF-8.
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ↳ Convertido para UTF-8 com sucesso.`);

  } catch (error) {
    console.error(`✗ Erro ao converter ${path.basename(filePath)}:`, error);
  }
}

/**
 * Cria uma cópia de segurança de um arquivo.
 * @param filePath O caminho do arquivo para fazer backup.
 */
function backupFile(filePath: string): void {
  try {
    const relativePath = path.relative(datasetPath, filePath);
    const backupFilePath = path.join(backupPath, relativePath);
    const backupDir = path.dirname(backupFilePath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(filePath, backupFilePath);
  } catch (error) {
    console.error(`✗ Erro ao criar backup de ${path.basename(filePath)}:`, error);
  }
}

/**
 * Processa um diretório recursivamente, convertendo todos os arquivos .csv.
 * @param dirPath O caminho do diretório a ser processado.
 */
function processDirectory(dirPath: string): void {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      processDirectory(itemPath);
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.csv')) {
      // 1. Fazer backup primeiro
      backupFile(itemPath);
      // 2. Converter o arquivo original
      convertFileToUtf8(itemPath);
    }
  }
}

// Função principal
function main() {
  try {
    console.log('Iniciando conversão de arquivos CSV para UTF-8...');

    if (!fs.existsSync(datasetPath)) {
      console.error(`Erro: Diretório de dataset não encontrado em '${datasetPath}'`);
      process.exit(1);
    }

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
      console.log(`Diretório de backup criado em: ${backupPath}`);
    }

    processDirectory(datasetPath);

    console.log('\nConversão concluída!');
    console.log(`Backup dos arquivos originais salvo em: ${backupPath}`);

  } catch (error) {
    console.error('Ocorreu um erro fatal durante a execução:', error);
    process.exit(1);
  }
}

main();
