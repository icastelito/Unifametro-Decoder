const fs = require("fs");
const path = require("path");

const diretorioEntrada = path.join(__dirname, "laravel", "storage", "app", "data", "in");
const diretorioSaida = path.join(__dirname, "laravel", "app", "data", "out");

// Verifica se o diretório de entrada existe, se não, cria
if (!fs.existsSync(diretorioEntrada)) {
  fs.mkdirSync(diretorioEntrada, { recursive: true });
}

// Verifica se o diretório de saída existe, se não, cria
if (!fs.existsSync(diretorioSaida)) {
  fs.mkdirSync(diretorioSaida, { recursive: true });
}

const temposModificacao = {};

function lerArquivosDiretorioEntrada(diretorioEntrada) {
  fs.readdir(diretorioEntrada, (err, arquivos) => {
    if (err) {
      console.error("Erro ao ler diretório de entrada:", err);
      return;
    }
    const arquivosDat = arquivos.filter((arquivo) => arquivo.endsWith(".dat"));
    arquivosDat.forEach((arquivo) => {
      const caminhoArquivo = path.join(diretorioEntrada, arquivo);
      fs.stat(caminhoArquivo, (err, stats) => {
        if (err) {
          console.error("Erro ao obter informações do arquivo:", err);
          return;
        }
        const tempoModificacao = stats.mtime.getTime();
        if (!temposModificacao[caminhoArquivo] || temposModificacao[caminhoArquivo] < tempoModificacao) {
          temposModificacao[caminhoArquivo] = tempoModificacao;
          processarArquivo(caminhoArquivo);
        }
      });
    });
  });
}

fs.watch(diretorioEntrada, (eventType, filename) => {
  if (eventType === "change" && filename.endsWith(".dat")) {
    lerArquivosDiretorioEntrada(diretorioEntrada);
  }
});

lerArquivosDiretorioEntrada(diretorioEntrada);

function lerArquivosDiretorioEntrada(diretorioEntrada) {
  fs.readdir(diretorioEntrada, (err, arquivos) => {
    if (err) {
      console.error("Erro ao ler diretório de entrada:", err);
      return;
    }

    const arquivosDat = arquivos.filter((arquivo) => arquivo.endsWith(".dat"));
    arquivosDat.forEach((arquivo) => processarArquivo(path.join(diretorioEntrada, arquivo)));
  });
}

function processarArquivo(caminhoArquivo) {
  fs.readFile(caminhoArquivo, "utf8", (err, dados) => {
    if (err) {
      console.error("Erro ao ler arquivo:", err);
      return;
    }

    const linhas = dados.split("\n");
    let numClientes = 0;
    let numVendedores = 0;
    let vendaMaisCara = { id: null, valor: -1 };
    const vendasPorVendedor = {};

    linhas.forEach((linha) => {
      const campos = linha.split("ç");
      const id = campos[0];
      if (id === "001") {
        numVendedores++;
      } else if (id === "002") {
        numClientes++;
      } else if (id === "003") {
        const idVendedor = campos[3];
        const match = campos[2].match(/\[(.*?)\]/);
        if (match) {
          const itens = match[1].split(",");
          let valorTotalVenda = 0;
          itens.forEach((item) => {
            const [idItem, quantidade, preco] = item.trim().split("-");
            valorTotalVenda += parseInt(quantidade) * parseFloat(preco);
          });
          if (!vendasPorVendedor[idVendedor]) {
            vendasPorVendedor[idVendedor] = 0;
          }
          vendasPorVendedor[idVendedor] += valorTotalVenda;
          if (valorTotalVenda > vendaMaisCara.valor) {
            vendaMaisCara = { id: itens[0].trim().split("-")[0], valor: valorTotalVenda };
          }
        }
      }
    });

    const piorVendedor = Object.keys(vendasPorVendedor).reduce(
      (pior, vendedor) => {
        if (vendasPorVendedor[vendedor] < pior.valor) {
          return { id: vendedor, valor: vendasPorVendedor[vendedor] };
        }
        return pior;
      },
      { id: null, valor: Infinity }
    );

    const metricas = {
      numClientes,
      numVendedores,
      vendaMaisCara: vendaMaisCara.id,
      piorVendedor: piorVendedor.id,
    };
    const conteudoArquivoSaida = JSON.stringify(metricas);
    const nomeArquivoSaida = path.basename(caminhoArquivo) + ".done.dat";
    const diretorioSaida = path.join(__dirname, "laravel", "app", "data", "out");
    fs.writeFile(path.join(diretorioSaida, nomeArquivoSaida), conteudoArquivoSaida, (err) => {
      if (err) {
        console.error("Erro ao escrever arquivo de saída:", err);
        return;
      }
      console.log(`Arquivo de saída criado: ${nomeArquivoSaida}`);
    });
  });
}
lerArquivosDiretorioEntrada(diretorioEntrada);
